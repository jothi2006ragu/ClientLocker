
const mongoose = require("mongoose");

const ChecklistItem = require("../models/ChecklistItem");
const Client = require("../models/Client");
const ClientAccess = require("../models/ClientAccess");

const AUDITOR_MAX_CLIENTS = 2;

// ==========================================
// CHECK WHETHER USER CAN ACCESS CLIENT
// ==========================================

const canAccessClient = async (user, clientId) => {
  if (!user || !user.firm_id || !mongoose.Types.ObjectId.isValid(clientId)) {
    return false;
  }

  const client = await Client.findOne({
    _id: clientId,
    firm_id: user.firm_id
  }).select("_id");

  if (!client) {
    return false;
  }

  if (user.role === "partner") {
    return true;
  }

  if (user.role === "client") {
    return String(user.client_id) === String(clientId);
  }

  if (user.role === "staff") {
    return Boolean(
      await ClientAccess.exists({
        person_id: user._id,
        client_id: clientId
      })
    );
  }

  if (user.role === "auditor") {
    const assignments = await ClientAccess.find({
      person_id: user._id
    })
      .sort({ created_at: 1, _id: 1 })
      .limit(AUDITOR_MAX_CLIENTS)
      .select("client_id")
      .lean();

    return assignments.some(
      (assignment) =>
        String(assignment.client_id) === String(clientId)
    );
  }

  return false;
};

// ==========================================
// GET CLIENT CHECKLIST
// ==========================================

const getClientChecklist = async (req, res) => {
  try {
    const { clientId } = req.params;

    const allowed = await canAccessClient(req.user, clientId);

    if (!allowed) {
      return res.status(403).json({
        success: false,
        message: "You do not have access to this client's checklist."
      });
    }

    const items = await ChecklistItem.find({
      client_id: clientId
    }).sort({ created_at: 1, _id: 1 });

    return res.status(200).json({
      success: true,
      count: items.length,
      items
    });
  } catch (error) {
    console.error("Get checklist error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve checklist."
    });
  }
};

// ==========================================
// UPDATE CHECKLIST ITEM
// ==========================================

const updateChecklistItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { done } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid checklist item ID."
      });
    }

    if (typeof done !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "Checklist status must be true or false."
      });
    }

    const item = await ChecklistItem.findById(id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Checklist item not found."
      });
    }

    const allowed = await canAccessClient(
      req.user,
      item.client_id
    );

    if (!allowed) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to update this checklist."
      });
    }

    if (req.user.role === "auditor") {
      return res.status(403).json({
        success: false,
        message: "Auditors have read-only checklist access."
      });
    }

    item.done = done;
    await item.save();

    return res.status(200).json({
      success: true,
      message: "Checklist updated successfully.",
      item
    });
  } catch (error) {
    console.error("Update checklist error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to update checklist."
    });
  }
};

module.exports = {
  getClientChecklist,
  updateChecklistItem
};
