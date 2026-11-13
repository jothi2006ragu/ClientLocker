
const ActivityLog = require("../models/ActivityLog");
const Person = require("../models/Person");

// ==========================================
// GET COMPLETE ACTIVITY LOG
// GET /api/activity
// PARTNER ONLY
// ==========================================

const getActivityLogs = async (req, res) => {
  try {
    const partner = req.user;

    // 1. Verify partner permissions on the server
    if (
      !partner ||
      partner.role !== "partner" ||
      !partner._id ||
      !partner.firm_id
    ) {
      return res.status(403).json({
        success: false,
        message: "Only partners can view activity logs."
      });
    }

    // 2. Get all people belonging to this partner's firm
    const firmPeople = await Person.find({
      firm_id: partner.firm_id
    })
      .select("_id")
      .lean();

    const personIds = firmPeople.map((person) => person._id);

    // 3. Retrieve only activity belonging to this firm
    const logs = await ActivityLog.find({
      person_id: { $in: personIds }
    })
      .populate({
        path: "person_id",
        select: "name email role"
      })
      .populate({
        path: "client_id",
        select: "name firm_id"
      })
      .populate({
        path: "file_id",
        select: "name file_type client_id"
      })
      .sort({
        created_at: -1,
        _id: -1
      })
      .limit(500)
      .lean();

    // 4. Return activity records
    return res.status(200).json({
      success: true,
      count: logs.length,
      activity: logs
    });

  } catch (error) {
    console.error("Get activity logs error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve activity logs."
    });
  }
};

module.exports = {
  getActivityLogs
};
