
const mongoose = require("mongoose");
const crypto = require("crypto");

const Client = require("../models/Client");
const ClientAccess = require("../models/ClientAccess");
const Person = require("../models/Person");
const MagicLink = require("../models/MagicLink");

const { sendMagicLinkEmail } = require("../services/emailService");

// ==========================================
// COMMON HELPERS
// ==========================================

const isValidObjectId = (id) =>
  mongoose.Types.ObjectId.isValid(id);

const requirePartner = (req, res) => {
  if (!req.user || req.user.role !== "partner") {
    res.status(403).json({
      success: false,
      message: "Only partners can perform this operation."
    });

    return false;
  }

  return true;
};

const getAuditorAllowedClientIds = async (auditorId) => {
  const assignments = await ClientAccess.find({
    person_id: auditorId
  })
    .sort({ created_at: 1, _id: 1 })
    .select("client_id")
    .limit(2)
    .lean();

  return assignments.map((item) => item.client_id);
};

// ==========================================
// GET CLIENTS
// GET /api/clients
// ==========================================

const getClients = async (req, res) => {
  try {
    const user = req.user;

    if (!user || !user.firm_id) {
      return res.status(401).json({
        success: false,
        message: "Authentication required."
      });
    }

    const firmId = user.firm_id;
    let clients = [];

    // PARTNER: All clients in the firm.
    if (user.role === "partner") {
      clients = await Client.find({
        firm_id: firmId
      })
        .select("_id name created_at")
        .sort({ name: 1 })
        .lean();
    }

    // STAFF: Only assigned clients.
    else if (user.role === "staff") {
      const assignments = await ClientAccess.find({
        person_id: user._id
      })
        .select("client_id")
        .lean();

      const clientIds = assignments.map(
        (item) => item.client_id
      );

      clients = await Client.find({
        _id: { $in: clientIds },
        firm_id: firmId
      })
        .select("_id name created_at")
        .sort({ name: 1 })
        .lean();
    }

    // AUDITOR: Maximum two assigned clients.
    else if (user.role === "auditor") {
      const allowedClientIds =
        await getAuditorAllowedClientIds(user._id);

      clients = await Client.find({
        _id: { $in: allowedClientIds },
        firm_id: firmId
      })
        .select("_id name created_at")
        .sort({ name: 1 })
        .lean();
    }

    // CLIENT: Only their own client record.
    else if (user.role === "client") {
      if (!user.client_id) {
        return res.status(403).json({
          success: false,
          message: "No client account is linked to this user."
        });
      }

      clients = await Client.find({
        _id: user.client_id,
        firm_id: firmId
      })
        .select("_id name created_at")
        .lean();
    } else {
      return res.status(403).json({
        success: false,
        message: "You cannot view clients."
      });
    }

    // Only partners receive client account details.
    let personMap = new Map();

    if (user.role === "partner" && clients.length > 0) {
      const clientIds = clients.map(
        (client) => client._id
      );

      const people = await Person.find({
        firm_id: firmId,
        role: "client",
        client_id: { $in: clientIds }
      })
        .select("_id name email client_id is_active")
        .lean();

      personMap = new Map(
        people.map((person) => [
          person.client_id.toString(),
          person
        ])
      );
    }

    const formattedClients = clients.map((client) => {
      const person = personMap.get(
        client._id.toString()
      );

      return {
        id: client._id.toString(),
        _id: client._id.toString(),
        name: client.name,
        created_at: client.created_at,

        ...(user.role === "partner" && {
          email: person?.email || null,
          user_id: person?._id.toString() || null,
          is_active: person ? person.is_active : false,
          account_status: !person
            ? "not_invited"
            : person.is_active
              ? "active"
              : "inactive"
        })
      };
    });

    return res.status(200).json({
      success: true,
      count: formattedClients.length,
      clients: formattedClients
    });
  } catch (error) {
    console.error("Get clients error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve clients."
    });
  }
};

// ==========================================
// CREATE CLIENT AND LOGIN ACCOUNT
// POST /api/clients
// ==========================================

const createClient = async (req, res) => {
  let client = null;

  try {
    if (!requirePartner(req, res)) {
      return;
    }

    const { name, email } = req.body;

    if (
      !name ||
      typeof name !== "string" ||
      !name.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Client name is required."
      });
    }

    const cleanName = name.trim();

    if (cleanName.length > 150) {
      return res.status(400).json({
        success: false,
        message: "Client name cannot exceed 150 characters."
      });
    }

    if (
      !email ||
      typeof email !== "string" ||
      !email.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Client email address is required."
      });
    }

    const cleanEmail = email.trim().toLowerCase();

    const emailPattern =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (
      cleanEmail.length > 254 ||
      !emailPattern.test(cleanEmail)
    ) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address."
      });
    }

    const firmId = req.user.firm_id;

    if (!firmId) {
      return res.status(401).json({
        success: false,
        message: "Partner firm information is missing."
      });
    }

    const existingClient = await Client.findOne({
      firm_id: firmId,
      name: cleanName
    });

    if (existingClient) {
      return res.status(409).json({
        success: false,
        message: "A client with this name already exists."
      });
    }

    const existingPerson = await Person.findOne({
      firm_id: firmId,
      email: cleanEmail
    });

    if (existingPerson) {
      return res.status(409).json({
        success: false,
        message: "This email address is already registered in your firm."
      });
    }

    // STEP 1: Create client record.
    client = await Client.create({
      firm_id: firmId,
      name: cleanName
    });

    // STEP 2: Create linked client login account.
    let person;

    try {
      person = await Person.create({
        firm_id: firmId,
        name: cleanName,
        email: cleanEmail,
        role: "client",
        client_id: client._id,
        auth_provider: "local",
        is_active: true
      });
    } catch (personError) {
      await Client.deleteOne({
        _id: client._id
      });

      client = null;
      throw personError;
    }

    // STEP 3: Send magic-link invitation.
    let invitationSent = false;

    try {
      const frontendUrl =
        process.env.FRONTEND_URL?.replace(/\/+$/, "");

      if (!frontendUrl) {
        throw new Error(
          "FRONTEND_URL is not configured."
        );
      }

      const rawToken = crypto
        .randomBytes(32)
        .toString("hex");

      const tokenHash = crypto
        .createHash("sha256")
        .update(rawToken)
        .digest("hex");

      const expiresAt = new Date(
        Date.now() + 15 * 60 * 1000
      );

      await MagicLink.updateMany(
        {
          person_id: person._id,
          used_at: null
        },
        {
          $set: {
            used_at: new Date()
          }
        }
      );

      await MagicLink.create({
        person_id: person._id,
        token_hash: tokenHash,
        expires_at: expiresAt
      });

      const magicLink =
        `${frontendUrl}/client/magic-login?token=${rawToken}`;

      try {
        await sendMagicLinkEmail(
          person.email,
          magicLink
        );

        invitationSent = true;
      } catch (emailError) {
        await MagicLink.updateOne(
          { token_hash: tokenHash },
          {
            $set: {
              used_at: new Date()
            }
          }
        );

        throw emailError;
      }
    } catch (invitationError) {
      console.error(
        "Client invitation email error:",
        invitationError.message
      );
    }

    return res.status(201).json({
      success: true,
      invitation_sent: invitationSent,

      message: invitationSent
        ? "Client and login account created. Magic-link invitation sent successfully."
        : "Client and login account created, but the invitation email could not be sent. Check email configuration and request a new magic link.",

      client: {
        id: client._id.toString(),
        _id: client._id.toString(),
        name: client.name,
        email: person.email,
        user_id: person._id.toString(),
        role: person.role,
        is_active: person.is_active,
        created_at: client.created_at
      }
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "This client name or email is already registered."
      });
    }

    console.error("Create client error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to create client and login account."
    });
  }
};

// ==========================================
// GET STAFF AND AUDITORS
// GET /api/staff
// ==========================================

const getStaffMembers = async (req, res) => {
  try {
    if (!requirePartner(req, res)) {
      return;
    }

    const people = await Person.find({
      firm_id: req.user.firm_id,
      role: { $in: ["staff", "auditor"] },
      is_active: true
    })
      .select("_id name email role is_active")
      .sort({ role: 1, name: 1 })
      .lean();

    const staff = people.filter(
      (person) => person.role === "staff"
    );

    const auditors = people.filter(
      (person) => person.role === "auditor"
    );

    const auditorIds = auditors.map(
      (person) => person._id
    );

    const assignments = auditorIds.length
      ? await ClientAccess.find({
          person_id: { $in: auditorIds }
        })
          .populate({
            path: "client_id",
            match: { firm_id: req.user.firm_id },
            select: "name"
          })
          .lean()
      : [];

    const auditorOverview = auditors.map((auditor) => {
      const assignedClients = assignments
        .filter(
          (assignment) =>
            String(assignment.person_id) ===
              String(auditor._id) &&
            assignment.client_id
        )
        .sort((a, b) => {
          const dateA = new Date(a.created_at || 0);
          const dateB = new Date(b.created_at || 0);
          return dateA - dateB;
        })
        .slice(0, 2)
        .map((assignment) => ({
          id: assignment.client_id._id.toString(),
          name: assignment.client_id.name
        }));

      return {
        id: auditor._id.toString(),
        _id: auditor._id.toString(),
        name: auditor.name,
        email: auditor.email,
        role: auditor.role,
        is_active: auditor.is_active,
        assigned_count: assignedClients.length,
        assignment_limit: 2,
        assigned_clients: assignedClients
      };
    });

    const formattedStaff = staff.map((person) => ({
      id: person._id.toString(),
      _id: person._id.toString(),
      name: person.name,
      email: person.email,
      role: person.role,
      is_active: person.is_active
    }));

    const allPeople = [
      ...formattedStaff,
      ...auditorOverview
    ];

    return res.status(200).json({
      success: true,
      count: allPeople.length,
      staff: formattedStaff,
      auditors: auditorOverview,
      people: allPeople
    });
  } catch (error) {
    console.error(
      "Get staff and auditor overview error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve staff and auditors."
    });
  }
};

// ==========================================
// ASSIGN CLIENT TO STAFF OR AUDITOR
// POST /api/clients/:id/assign
// ==========================================

const assignClient = async (req, res) => {
  try {
    if (!requirePartner(req, res)) {
      return;
    }

    const { id } = req.params;

    const personId =
      req.body.staff_id ||
      req.body.auditor_id ||
      req.body.person_id;

    if (
      !isValidObjectId(id) ||
      !isValidObjectId(personId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid client or person ID."
      });
    }

    const client = await Client.findOne({
      _id: id,
      firm_id: req.user.firm_id
    });

    if (!client) {
      return res.status(404).json({
        success: false,
        message: "Client not found in your firm."
      });
    }

    const person = await Person.findOne({
      _id: personId,
      firm_id: req.user.firm_id,
      role: { $in: ["staff", "auditor"] },
      is_active: true
    });

    if (!person) {
      return res.status(404).json({
        success: false,
        message: "Active staff member or auditor not found."
      });
    }

    const existingAssignment = await ClientAccess.findOne({
      person_id: person._id,
      client_id: client._id
    });

    if (existingAssignment) {
      return res.status(409).json({
        success: false,
        message: "This person is already assigned to this client."
      });
    }

    // Enforce auditor limit on the server.
    if (person.role === "auditor") {
      const auditorAssignments =
        await ClientAccess.countDocuments({
          person_id: person._id
        });

      if (auditorAssignments >= 2) {
        return res.status(400).json({
          success: false,
          message: "This auditor already has 2 assigned clients. Remove an existing assignment before adding another."
        });
      }
    }

    const assignment = await ClientAccess.create({
      person_id: person._id,
      client_id: client._id,
      given_by: req.user._id
    });

    return res.status(201).json({
      success: true,
      message: `${person.name} (${person.role}) assigned successfully.`,
      assignment: {
        id: assignment._id.toString(),
        client_id: client._id.toString(),
        person_id: person._id.toString(),
        staff_id:
          person.role === "staff"
            ? person._id.toString()
            : null,
        auditor_id:
          person.role === "auditor"
            ? person._id.toString()
            : null,
        person_name: person.name,
        person_email: person.email,
        person_role: person.role,
        created_at: assignment.created_at
      }
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "This assignment already exists."
      });
    }

    console.error("Assign client error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to assign client."
    });
  }
};

// ==========================================
// GET CLIENT ASSIGNMENTS
// GET /api/clients/:id/assignments
// ==========================================

const getClientAssignments = async (req, res) => {
  try {
    if (!requirePartner(req, res)) {
      return;
    }

    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid client ID."
      });
    }

    const client = await Client.findOne({
      _id: id,
      firm_id: req.user.firm_id
    });

    if (!client) {
      return res.status(404).json({
        success: false,
        message: "Client not found."
      });
    }

    const assignments = await ClientAccess.find({
      client_id: client._id
    })
      .populate({
        path: "person_id",
        match: {
          firm_id: req.user.firm_id,
          role: { $in: ["staff", "auditor"] }
        },
        select: "name email role is_active"
      })
      .sort({ created_at: -1 })
      .lean();

    const formattedAssignments = assignments
      .filter((item) => item.person_id)
      .map((item) => ({
        assignment_id: item._id.toString(),
        id: item.person_id._id.toString(),
        person_id: item.person_id._id.toString(),
        name: item.person_id.name,
        email: item.person_id.email,
        role: item.person_id.role,
        active: item.person_id.is_active,
        assigned_at: item.created_at
      }));

    return res.status(200).json({
      success: true,
      client: {
        id: client._id.toString(),
        name: client.name
      },
      count: formattedAssignments.length,
      assignments: formattedAssignments,
      staff: formattedAssignments.filter(
        (person) => person.role === "staff"
      ),
      auditors: formattedAssignments.filter(
        (person) => person.role === "auditor"
      )
    });
  } catch (error) {
    console.error("Get assignments error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve client assignments."
    });
  }
};

// ==========================================
// REMOVE STAFF OR AUDITOR ACCESS
// DELETE /api/clients/:id/assign/:staffId
// ==========================================

const removeClientAssignment = async (req, res) => {
  try {
    if (!requirePartner(req, res)) {
      return;
    }

    const { id, staffId } = req.params;

    if (
      !isValidObjectId(id) ||
      !isValidObjectId(staffId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid client or person ID."
      });
    }

    const client = await Client.findOne({
      _id: id,
      firm_id: req.user.firm_id
    });

    if (!client) {
      return res.status(404).json({
        success: false,
        message: "Client not found."
      });
    }

    const person = await Person.findOne({
      _id: staffId,
      firm_id: req.user.firm_id,
      role: { $in: ["staff", "auditor"] }
    });

    if (!person) {
      return res.status(404).json({
        success: false,
        message: "Staff member or auditor not found."
      });
    }

    const assignment = await ClientAccess.findOneAndDelete({
      person_id: person._id,
      client_id: client._id
    });

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: "Client assignment not found."
      });
    }

    return res.status(200).json({
      success: true,
      message: `${person.role} access removed successfully.`,
      removed: {
        person_id: person._id.toString(),
        person_name: person.name,
        role: person.role,
        client_id: client._id.toString()
      }
    });
  } catch (error) {
    console.error("Remove assignment error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to remove assignment."
    });
  }
};

// ==========================================
// EXPORT CONTROLLERS
// ==========================================

module.exports = {
  getClients,
  createClient,
  getStaffMembers,
  assignClient,
  getClientAssignments,
  removeClientAssignment
};
