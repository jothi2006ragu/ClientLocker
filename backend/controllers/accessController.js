
const mongoose = require("mongoose");

const Person = require("../models/Person");
const Client = require("../models/Client");
const ClientAccess = require("../models/ClientAccess");
const ActivityLog = require("../models/ActivityLog");

const AUDITOR_MAX_CLIENTS = 2;

// ==========================================
// COMMON VALIDATION
// ==========================================

const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

const isValidPartner = (partner) => {
  return Boolean(
    partner &&
    partner._id &&
    partner.firm_id &&
    partner.role === "partner"
  );
};

// ==========================================
// ACTIVITY LOGGING
// ==========================================

const recordAccessActivity = async (personId, action, clientId) => {
  try {
    await ActivityLog.create({
      person_id: personId,
      client_id: clientId || null,
      action,
      blocked: false
    });
  } catch (error) {
    // Do not fail an access operation because logging failed.
    console.error("Access activity logging error:", error);
  }
};

// ==========================================
// GIVE CLIENT ACCESS
// POST /api/access
// PARTNER ONLY
// ==========================================

const giveClientAccess = async (req, res) => {
  try {
    const { person_id, client_id } = req.body || {};
    const partner = req.user;

    // 1. Verify partner
    if (!isValidPartner(partner)) {
      return res.status(403).json({
        success: false,
        message: "Partner authentication is required."
      });
    }

    // 2. Validate required IDs
    if (!person_id || !client_id) {
      return res.status(400).json({
        success: false,
        message: "Person ID and Client ID are required."
      });
    }

    if (
      !isValidObjectId(person_id) ||
      !isValidObjectId(client_id)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid person ID or client ID."
      });
    }

    // 3. Find active person in the partner's firm
    const person = await Person.findOne({
      _id: person_id,
      firm_id: partner.firm_id,
      is_active: true
    });

    if (!person) {
      return res.status(404).json({
        success: false,
        message: "Active person not found in your firm."
      });
    }

    // 4. Only staff and auditors can receive assignments
    if (!["staff", "auditor"].includes(person.role)) {
      return res.status(400).json({
        success: false,
        message: "Access can only be assigned to staff or auditors."
      });
    }

    // 5. Find client in the partner's firm
    const client = await Client.findOne({
      _id: client_id,
      firm_id: partner.firm_id
    });

    if (!client) {
      return res.status(404).json({
        success: false,
        message: "Client not found in your firm."
      });
    }

    // 6. Prevent duplicate assignments
    const existingAccess = await ClientAccess.findOne({
      person_id: person._id,
      client_id: client._id
    });

    if (existingAccess) {
      return res.status(409).json({
        success: false,
        message: "This person already has access to this client."
      });
    }

    // 7. Enforce auditor two-client limit
    if (person.role === "auditor") {
      const assignedCount = await ClientAccess.countDocuments({
        person_id: person._id
      });

      if (assignedCount >= AUDITOR_MAX_CLIENTS) {
        return res.status(403).json({
          success: false,
          message:
            "This auditor already has the maximum of two assigned clients. Remove an existing assignment first.",
          assigned_count: assignedCount,
          maximum_assignments: AUDITOR_MAX_CLIENTS
        });
      }
    }

    // 8. Create assignment
    const access = await ClientAccess.create({
      person_id: person._id,
      client_id: client._id,
      given_by: partner._id
    });

    // 9. Record activity
    await recordAccessActivity(
      partner._id,
      "ACCESS_GRANTED",
      client._id
    );

    return res.status(201).json({
      success: true,
      message: "Client access granted successfully.",
      access: {
        _id: access._id,
        person_id: access.person_id,
        client_id: access.client_id,
        given_by: access.given_by,
        created_at: access.created_at
      }
    });

  } catch (error) {
    console.error("Give client access error:", error);

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "This person already has access to this client."
      });
    }

    return res.status(500).json({
      success: false,
      message: "Unable to grant client access."
    });
  }
};

// ==========================================
// REMOVE CLIENT ACCESS
// DELETE /api/access/:id
// PARTNER ONLY
// ==========================================

const removeClientAccess = async (req, res) => {
  try {
    const { id } = req.params;
    const partner = req.user;

    // 1. Verify partner
    if (!isValidPartner(partner)) {
      return res.status(403).json({
        success: false,
        message: "Partner authentication is required."
      });
    }

    // 2. Validate assignment ID
    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid access ID."
      });
    }

    // 3. Find assignment
    const access = await ClientAccess.findById(id);

    if (!access) {
      return res.status(404).json({
        success: false,
        message: "Access assignment not found."
      });
    }

    // 4. Verify client belongs to partner's firm
    const client = await Client.findOne({
      _id: access.client_id,
      firm_id: partner.firm_id
    });

    if (!client) {
      return res.status(403).json({
        success: false,
        message: "You cannot remove access outside your firm."
      });
    }

    // 5. Verify assigned person belongs to partner's firm
    const assignedPerson = await Person.findOne({
      _id: access.person_id,
      firm_id: partner.firm_id
    });

    if (!assignedPerson) {
      return res.status(403).json({
        success: false,
        message: "Assigned person does not belong to your firm."
      });
    }

    // 6. Remove assignment
    const deletion = await ClientAccess.deleteOne({
      _id: access._id,
      person_id: assignedPerson._id,
      client_id: client._id
    });

    if (deletion.deletedCount !== 1) {
      return res.status(404).json({
        success: false,
        message: "Access assignment no longer exists."
      });
    }

    // 7. Record activity
    await recordAccessActivity(
      partner._id,
      "ACCESS_REMOVED",
      client._id
    );

    return res.status(200).json({
      success: true,
      message: "Client access removed successfully."
    });

  } catch (error) {
    console.error("Remove client access error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to remove client access."
    });
  }
};

// ==========================================
// GET PEOPLE ASSIGNED TO A CLIENT
// GET /api/access/client/:clientId
// PARTNER ONLY
// ==========================================

const getClientAccess = async (req, res) => {
  try {
    const { clientId } = req.params;
    const partner = req.user;

    // 1. Verify partner
    if (!isValidPartner(partner)) {
      return res.status(403).json({
        success: false,
        message: "Partner authentication is required."
      });
    }

    // 2. Validate client ID
    if (!isValidObjectId(clientId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid client ID."
      });
    }

    // 3. Verify client belongs to partner's firm
    const client = await Client.findOne({
      _id: clientId,
      firm_id: partner.firm_id
    });

    if (!client) {
      return res.status(404).json({
        success: false,
        message: "Client not found."
      });
    }

    // 4. Retrieve assignments
    const assignments = await ClientAccess.find({
      client_id: client._id
    })
      .populate({
        path: "person_id",
        select: "name email role is_active"
      })
      .populate({
        path: "given_by",
        select: "name email"
      })
      .sort({
        created_at: -1
      })
      .lean();

    // 5. Return assignments
    return res.status(200).json({
      success: true,
      count: assignments.length,
      access: assignments
    });

  } catch (error) {
    console.error("Get client access error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve client access."
    });
  }
};

module.exports = {
  giveClientAccess,
  removeClientAccess,
  getClientAccess
};
