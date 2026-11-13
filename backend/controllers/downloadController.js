
const crypto = require("crypto");
const axios = require("axios");

const DownloadLink = require("../models/DownloadLink");
const StoredFile = require("../models/File");
const Client = require("../models/Client");
const ClientAccess = require("../models/ClientAccess");
const ActivityLog = require("../models/ActivityLog");

const {
  generatePrivateDownloadUrl
} = require("../services/cloudinaryService");

const DOWNLOAD_EXPIRY_MS = 10 * 60 * 1000;
const DOWNLOAD_EXPIRY_SECONDS = DOWNLOAD_EXPIRY_MS / 1000;
const AUDITOR_CLIENT_LIMIT = 2;

// ==========================================
// RECORD ACTIVITY
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
// VERIFY CURRENT CLIENT ACCESS
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

    // AUDITOR: Only two permitted clients in their firm.
    if (user.role === "auditor") {
      const allowedAssignments = await ClientAccess.find({
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

      const allowedClientIds = allowedAssignments
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
      "Client permission verification error:",
      error.message
    );

    // Fail closed if permission verification fails.
    return false;
  }
};

// ==========================================
// BLOCK DOWNLOAD AND RECORD ACTIVITY
// ==========================================

const blockDownload = async (
  res,
  user,
  file,
  message
) => {
  await recordActivity({
    personId: user?._id,
    clientId: file?.client_id || null,
    fileId: file?._id || null,
    action: "FILE_DOWNLOAD_BLOCKED",
    blocked: true
  });

  return res.status(403).json({
    success: false,
    message
  });
};

// ==========================================
// CREATE DOWNLOAD LINK
// POST /api/files/:id/link
// ==========================================

const createDownloadLink = async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user;

    // 1. Authentication check.
    if (!user || !user._id || !user.firm_id) {
      return res.status(401).json({
        success: false,
        message: "Authentication required."
      });
    }

    // 2. Validate file ID.
    if (!id || !/^[a-f\d]{24}$/i.test(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid file ID."
      });
    }

    // 3. Find requested file.
    const file = await StoredFile.findById(id);

    if (!file) {
      return res.status(404).json({
        success: false,
        message: "File not found."
      });
    }

    // 4. Find file's client in the user's firm.
    const client = await Client.findOne({
      _id: file.client_id,
      firm_id: user.firm_id
    });

    if (!client) {
      return blockDownload(
        res,
        user,
        file,
        "The client associated with this file is unavailable."
      );
    }

    // 5. Check current access.
    const hasAccess = await canAccessClient(
      user,
      client
    );

    if (!hasAccess) {
      return blockDownload(
        res,
        user,
        file,
        "You do not have permission to download this file."
      );
    }

    // 6. Generate a cryptographically secure token.
    const token = crypto
      .randomBytes(32)
      .toString("hex");

    // 7. Hash the token before storing it.
    const tokenHash = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    // 8. Link expires after 10 minutes.
    const expiresAt = new Date(
      Date.now() + DOWNLOAD_EXPIRY_MS
    );

    // 9. Save only the token hash in MongoDB.
    await DownloadLink.create({
      token_hash: tokenHash,
      file_id: file._id,
      person_id: user._id,
      expires_at: expiresAt
    });

    // Return the raw token only to the authenticated user.
    // Never return the Cloudinary URL.
    const downloadUrl = `/api/links/${token}`;

    return res.status(201).json({
      success: true,
      message: "Download link created successfully.",
      downloadUrl,
      expiresIn: DOWNLOAD_EXPIRY_SECONDS,
      expiresAt
    });

  } catch (error) {
    console.error(
      "Create download link error:",
      error.message
    );

    return res.status(500).json({
      success: false,
      message: "Unable to create download link."
    });
  }
};

// ==========================================
// DOWNLOAD FILE
// GET /api/links/:token
// ==========================================

const downloadFile = async (req, res) => {
  const user = req.user;
  let cloudinaryStream = null;

  try {
    // 1. Authentication check.
    if (!user || !user._id || !user.firm_id) {
      return res.status(401).json({
        success: false,
        message: "Authentication required."
      });
    }

    const { token } = req.params;

    // 2. Validate token format.
    if (
      !token ||
      !/^[a-f\d]{64}$/i.test(token)
    ) {
      return blockDownload(
        res,
        user,
        null,
        "Invalid download link."
      );
    }

    // 3. Hash the received token.
    const tokenHash = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    // 4. Find the link using its hash.
    // Explicitly select token_hash because the model
    // has select:false for this field.
    const downloadLink = await DownloadLink.findOne({
      token_hash: tokenHash
    }).select("+token_hash");

    if (!downloadLink) {
      return blockDownload(
        res,
        user,
        null,
        "Download link is invalid or unavailable."
      );
    }

    // 5. Find original file.
    const file = await StoredFile.findById(
      downloadLink.file_id
    );

    if (!file) {
      return blockDownload(
        res,
        user,
        null,
        "The requested file is unavailable."
      );
    }

    // 6. Link must belong to authenticated user.
    if (
      String(downloadLink.person_id) !==
      String(user._id)
    ) {
      return blockDownload(
        res,
        user,
        file,
        "This download link belongs to another user."
      );
    }

    // 7. Link must not have expired.
    if (
      !downloadLink.expires_at ||
      new Date(downloadLink.expires_at).getTime() <=
        Date.now()
    ) {
      return blockDownload(
        res,
        user,
        file,
        "This download link has expired."
      );
    }

    // 8. Find current client record in user's firm.
    const client = await Client.findOne({
      _id: file.client_id,
      firm_id: user.firm_id
    });

    if (!client) {
      return blockDownload(
        res,
        user,
        file,
        "The client associated with this file is unavailable."
      );
    }

    // 9. Recheck current client access.
    // Removing an assignment immediately revokes access.
    const hasAccess = await canAccessClient(
      user,
      client
    );

    if (!hasAccess) {
      return blockDownload(
        res,
        user,
        file,
        "Your access to this client's files has been removed."
      );
    }

    // ==========================================
    // ALL SECURITY CHECKS PASSED
    // ==========================================

    // Generate a short-lived Cloudinary URL internally.
    // Never return this URL to the frontend.
    const privateUrl = generatePrivateDownloadUrl(
      file,
      60
    );

    const cloudinaryResponse = await axios.get(
      privateUrl,
      {
        responseType: "stream",
        timeout: 30000,
        maxRedirects: 3
      }
    );

    cloudinaryStream = cloudinaryResponse.data;

    // File MIME types.
    const mimeTypes = {
      PDF: "application/pdf",
      JPG: "image/jpeg",
      PNG: "image/png"
    };

    // Sanitize filename.
    const safeFileName = (
      file.name || "download"
    )
      .replace(/[\r\n"]/g, "_")
      .replace(/[^\x20-\x7E]/g, "_");

    // Secure response headers.
    res.setHeader(
      "Content-Type",
      mimeTypes[file.file_type] ||
        "application/octet-stream"
    );

    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${safeFileName}"`
    );

    res.setHeader(
      "Cache-Control",
      "private, no-store"
    );

    res.setHeader(
      "X-Content-Type-Options",
      "nosniff"
    );

    if (
      cloudinaryResponse.headers["content-length"]
    ) {
      res.setHeader(
        "Content-Length",
        cloudinaryResponse.headers["content-length"]
      );
    }

    // Record successful opening after the response finishes.
    res.once("finish", () => {
      if (
        res.statusCode >= 200 &&
        res.statusCode < 300
      ) {
        void recordActivity({
          personId: user._id,
          clientId: client._id,
          fileId: file._id,
          action: "FILE_OPENED",
          blocked: false
        });
      }
    });

    // Handle Cloudinary stream errors.
    cloudinaryStream.on("error", (error) => {
      console.error(
        "Cloudinary stream error:",
        error.message
      );

      if (!res.headersSent) {
        res.status(502).end(
          "Unable to retrieve the file."
        );
      } else {
        res.destroy(error);
      }
    });

    // Stream file to authenticated user.
    cloudinaryStream.pipe(res);

  } catch (error) {
    console.error(
      "Download file error:",
      error.message
    );

    if (
      cloudinaryStream &&
      !cloudinaryStream.destroyed
    ) {
      cloudinaryStream.destroy();
    }

    if (!res.headersSent) {
      return res.status(502).json({
        success: false,
        message:
          "Unable to retrieve the file. Please try again."
      });
    }

    res.destroy(error);
  }
};

// ==========================================
// EXPORT CONTROLLERS
// ==========================================

module.exports = {
  createDownloadLink,
  downloadFile
};
