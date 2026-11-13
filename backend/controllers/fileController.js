
const mongoose = require("mongoose");
const crypto = require("crypto");

const StoredFile = require("../models/File");
const Client = require("../models/Client");
const ClientAccess = require("../models/ClientAccess");
const ChecklistItem = require("../models/ChecklistItem");
const ActivityLog = require("../models/ActivityLog");
const DownloadLink = require("../models/DownloadLink");

const {
  uploadToCloudinary
} = require("../services/cloudinaryService");

const MAX_FILE_SIZE = 4 * 1024 * 1024;
const DOWNLOAD_EXPIRY_SECONDS = 600;
const AUDITOR_CLIENT_LIMIT = 2;

// ==========================================
// HELPER: RECORD ACTIVITY
// ==========================================

const recordActivity = async ({
  personId,
  clientId = null,
  fileId = null,
  action,
  blocked = false
}) => {
  if (!personId) {
    console.error("Activity log skipped: person ID is missing.");
    return;
  }

  try {
    await ActivityLog.create({
      person_id: personId,
      client_id: clientId,
      file_id: fileId,
      action,
      blocked
    });
  } catch (error) {
    console.error("Activity logging error:", error.message);
  }
};

// ==========================================
// HELPER: CHECK CLIENT ACCESS
// ==========================================

const canAccessClient = async (user, client) => {
  try {
    if (
      !user ||
      !user._id ||
      !user.firm_id ||
      !client ||
      !client._id ||
      !client.firm_id
    ) {
      return false;
    }

    // User and client must belong to the same firm.
    if (
      String(user.firm_id) !== String(client.firm_id)
    ) {
      return false;
    }

    // PARTNER: All clients in their firm.
    if (user.role === "partner") {
      return true;
    }

    // CLIENT: Only their own client record.
    if (user.role === "client") {
      return Boolean(
        user.client_id &&
        String(user.client_id) === String(client._id)
      );
    }

    // STAFF: Explicit assignment required.
    if (user.role === "staff") {
      const assignment = await ClientAccess.exists({
        person_id: user._id,
        client_id: client._id
      });

      return Boolean(assignment);
    }

    // AUDITOR: Maximum two assigned clients.
    if (user.role === "auditor") {
      const assignments = await ClientAccess.find({
        person_id: user._id
      })
        .sort({
          created_at: 1,
          _id: 1
        })
        .limit(AUDITOR_CLIENT_LIMIT)
        .populate({
          path: "client_id",
          match: {
            firm_id: user.firm_id
          },
          select: "_id firm_id"
        })
        .lean();

      const allowedClientIds = assignments
        .filter((assignment) => assignment.client_id)
        .map((assignment) =>
          String(assignment.client_id._id)
        );

      return allowedClientIds.includes(
        String(client._id)
      );
    }

    return false;
  } catch (error) {
    console.error(
      "Client permission check error:",
      error.message
    );

    // Fail closed if permission verification fails.
    return false;
  }
};

// ==========================================
// HELPER: LOG BLOCKED ACCESS
// ==========================================

const logBlockedAccess = async (
  user,
  file = null,
  client = null
) => {
  if (!user?._id) {
    return;
  }

  const clientId =
    client?._id ||
    file?.client_id ||
    null;

  await recordActivity({
    personId: user._id,
    clientId,
    fileId: file?._id || null,
    action: "FILE_DOWNLOAD_BLOCKED",
    blocked: true
  });
};

// ==========================================
// 1. UPLOAD FILE
// POST /api/clients/:clientId/files
// ==========================================

const uploadFile = async (req, res) => {
  let uploadedAsset = null;
  let savedFile = null;

  try {
    const user = req.user;
    const client = req.client;

    if (!user || !user._id || !client) {
      return res.status(401).json({
        success: false,
        message:
          "Authenticated user and client information are required."
      });
    }

    // Only partners and staff can upload.
    if (!["partner", "staff"].includes(user.role)) {
      await logBlockedAccess(user, null, client);

      return res.status(403).json({
        success: false,
        message: "Only partners and staff can upload files."
      });
    }

    // Recheck current client access.
    const hasAccess = await canAccessClient(user, client);

    if (!hasAccess) {
      await logBlockedAccess(user, null, client);

      return res.status(403).json({
        success: false,
        message:
          "You do not have permission to upload files for this client."
      });
    }

    // Check selected file.
    if (!req.file || !req.file.buffer) {
      return res.status(400).json({
        success: false,
        message: "Please select a file to upload."
      });
    }

    // Enforce 4 MB limit.
    const actualFileSize =
      req.file.buffer.length || req.file.size || 0;

    if (
      actualFileSize <= 0 ||
      actualFileSize > MAX_FILE_SIZE
    ) {
      return res.status(400).json({
        success: false,
        message:
          "File size must be greater than zero and cannot exceed 4 MB."
      });
    }

    // Allowed MIME types.
    const fileTypes = {
      "application/pdf": "PDF",
      "image/jpeg": "JPG",
      "image/png": "PNG"
    };

    const fileType = fileTypes[req.file.mimetype];

    if (!fileType) {
      return res.status(400).json({
        success: false,
        message: "Only PDF, JPG and PNG files are allowed."
      });
    }

    // Validate original filename.
    if (
      !req.file.originalname ||
      typeof req.file.originalname !== "string"
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid filename."
      });
    }

    const safeOriginalName = req.file.originalname
      .replace(/[\r\n]/g, "_")
      .trim();

    if (!safeOriginalName) {
      return res.status(400).json({
        success: false,
        message: "Invalid filename."
      });
    }

    // ==========================================
    // VALIDATE CHECKLIST ITEM
    // ==========================================

    let checklistItemId = null;

    if (req.body.checklist_item_id) {
      if (
        !mongoose.Types.ObjectId.isValid(
          req.body.checklist_item_id
        )
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid checklist item ID."
        });
      }

      const checklistItem = await ChecklistItem.findOne({
        _id: req.body.checklist_item_id,
        client_id: client._id
      });

      if (!checklistItem) {
        return res.status(400).json({
          success: false,
          message:
            "Checklist item does not belong to this client."
        });
      }

      checklistItemId = checklistItem._id;
    }

    // ==========================================
    // UPLOAD TO PRIVATE CLOUDINARY STORAGE
    // ==========================================

    uploadedAsset = await uploadToCloudinary(req.file);

    if (
      !uploadedAsset ||
      !uploadedAsset.public_id ||
      !uploadedAsset.asset_id
    ) {
      throw new Error(
        "Cloudinary did not return valid file information."
      );
    }

    // ==========================================
    // SAVE FILE METADATA IN MONGODB
    // ==========================================

    savedFile = await StoredFile.create({
      client_id: client._id,
      uploaded_by: user._id,
      name: safeOriginalName,
      storage_path: uploadedAsset.public_id,
      cloudinary_asset_id: uploadedAsset.asset_id,
      cloudinary_resource_type:
        uploadedAsset.resource_type,
      file_type: fileType,
      file_size: uploadedAsset.bytes || actualFileSize,
      checklist_item_id: checklistItemId
    });

    // ==========================================
    // RECORD SUCCESSFUL UPLOAD
    // ==========================================

    await recordActivity({
      personId: user._id,
      clientId: client._id,
      fileId: savedFile._id,
      action: "FILE_UPLOADED",
      blocked: false
    });

    return res.status(201).json({
      success: true,
      message: "File uploaded successfully.",
      file: {
        id: savedFile._id.toString(),
        client_id: savedFile.client_id.toString(),
        name: savedFile.name,
        file_type: savedFile.file_type,
        file_size: savedFile.file_size,
        uploaded_by: user.name,
        created_at: savedFile.created_at,
        checklist_item_id:
          savedFile.checklist_item_id
            ? savedFile.checklist_item_id.toString()
            : null
      }
    });

  } catch (error) {
    console.error("File upload error:", error);

    // Remove Cloudinary asset if MongoDB saving failed.
    if (uploadedAsset?.public_id && !savedFile) {
      try {
        await require("../config/cloudinary").uploader.destroy(
          uploadedAsset.public_id,
          {
            resource_type:
              uploadedAsset.resource_type || "image",
            type: "authenticated",
            invalidate: true
          }
        );
      } catch (cleanupError) {
        console.error(
          "Cloudinary cleanup error:",
          cleanupError.message
        );
      }
    }

    return res.status(500).json({
      success: false,
      message:
        "Unable to upload file. Please try again."
    });
  }
};

// ==========================================
// 2. LIST CLIENT FILES
// GET /api/clients/:clientId/files
// ==========================================

const getClientFiles = async (req, res) => {
  try {
    const user = req.user;
    const client = req.client;

    if (!user || !client) {
      return res.status(401).json({
        success: false,
        message:
          "Authenticated user and client information are required."
      });
    }

    // Recheck access before returning file metadata.
    const hasAccess = await canAccessClient(user, client);

    if (!hasAccess) {
      await logBlockedAccess(user, null, client);

      return res.status(403).json({
        success: false,
        message:
          "You do not have permission to view these files."
      });
    }

    const files = await StoredFile.find({
      client_id: client._id
    })
      .select(
        "_id client_id name file_type file_size uploaded_by checklist_item_id created_at"
      )
      .populate("uploaded_by", "name email")
      .sort({
        created_at: -1
      })
      .lean();

    const formattedFiles = files.map((file) => ({
      id: file._id.toString(),
      client_id: file.client_id.toString(),
      name: file.name,
      file_type: file.file_type,
      file_size: file.file_size,
      uploaded_by: file.uploaded_by
        ? {
            id: file.uploaded_by._id.toString(),
            name: file.uploaded_by.name,
            email: file.uploaded_by.email
          }
        : null,
      checklist_item_id: file.checklist_item_id
        ? file.checklist_item_id.toString()
        : null,
      created_at: file.created_at
    }));

    return res.status(200).json({
      success: true,
      count: formattedFiles.length,
      files: formattedFiles
    });

  } catch (error) {
    console.error("Get client files error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve client files."
    });
  }
};

// ==========================================
// 3. OPEN FILE
// LEGACY COMPATIBILITY ENDPOINT
// ==========================================

const openFile = async (req, res) => {
  try {
    const user = req.user;
    const { id } = req.params;

    if (!user || !user._id || !user.firm_id) {
      return res.status(401).json({
        success: false,
        message: "Authentication required."
      });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid file ID."
      });
    }

    const file = await StoredFile.findById(id);

    if (!file) {
      await logBlockedAccess(user);

      return res.status(404).json({
        success: false,
        message: "File not found."
      });
    }

    const client = await Client.findOne({
      _id: file.client_id,
      firm_id: user.firm_id
    });

    const hasAccess = await canAccessClient(
      user,
      client
    );

    if (!hasAccess) {
      await logBlockedAccess(user, file, client);

      return res.status(403).json({
        success: false,
        message:
          "You do not have permission to open this file."
      });
    }

    // Generate a secure random application token.
    const token = crypto
      .randomBytes(32)
      .toString("hex");

    // Hash the token before storing it.
    const tokenHash = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    const expiresAt = new Date(
      Date.now() + DOWNLOAD_EXPIRY_SECONDS * 1000
    );

    // Store only the hash, not the original token.
    await DownloadLink.create({
      token_hash: tokenHash,
      file_id: file._id,
      person_id: user._id,
      expires_at: expiresAt
    });

    return res.status(200).json({
      success: true,
      message: "Secure download link created.",
      file: {
        id: file._id.toString(),
        name: file.name,
        file_type: file.file_type
      },
      downloadUrl: `/api/links/${token}`,
      expiresIn: DOWNLOAD_EXPIRY_SECONDS,
      expiresAt
    });

  } catch (error) {
    console.error("Open file error:", error);

    return res.status(500).json({
      success: false,
      message:
        "Unable to create secure file link."
    });
  }
};

// ==========================================
// EXPORT CONTROLLERS
// ==========================================

module.exports = {
  uploadFile,
  getClientFiles,
  openFile
};
