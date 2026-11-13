
import { useState } from "react";
import { openClientFile } from "../services/api";
import "./FileList.css";

export default function FileList({
  clientId,
  files = [],
  onRefresh
}) {
  const [openingId, setOpeningId] = useState(null);
  const [error, setError] = useState("");

  const formatDate = (date) => {
    if (!date) return "Date unavailable";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "Date unavailable";
    }

    return parsedDate.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });
  };

  const formatSize = (bytes) => {
    if (bytes === undefined || bytes === null) {
      return "—";
    }

    const size = Number(bytes);

    if (!Number.isFinite(size) || size < 0) {
      return "—";
    }

    if (size < 1024) {
      return `${size} B`;
    }

    return `${(size / 1024).toFixed(1)} KB`;
  };

  // ==========================================
  // OPEN FILE USING AUTHENTICATED DOWNLOAD
  // ==========================================

  const handleOpen = async (file) => {
    const fileId = file.id || file._id;

    if (!fileId) {
      setError("Unable to open document. File ID is missing.");
      return;
    }

    let newTab = null;
    let objectUrl = null;

    try {
      setOpeningId(fileId);
      setError("");

      // Open the tab immediately during the click event
      // to avoid browser popup blocking.
      newTab = window.open("about:blank", "_blank");

      if (!newTab) {
        throw new Error(
          "Your browser blocked the document tab. Please allow pop-ups and try again."
        );
      }

      newTab.opener = null;

      newTab.document.title = "Opening ClientLocker document...";
      newTab.document.body.innerHTML =
        "<p style='font-family:Arial,sans-serif;padding:24px'>Opening secure document...</p>";

      // Fetch through the authenticated backend API.
      const result = await openClientFile(fileId);

      const blob =
        result instanceof Blob
          ? result
          : result?.blob instanceof Blob
            ? result.blob
            : null;

      if (!blob || blob.size === 0) {
        throw new Error("The document could not be downloaded.");
      }

      // Allow only PDF, JPG and PNG.
      const allowedTypes = [
        "application/pdf",
        "image/jpeg",
        "image/png"
      ];

      const contentType = blob.type
        ? blob.type.split(";")[0].trim().toLowerCase()
        : "";

      if (contentType && !allowedTypes.includes(contentType)) {
        throw new Error("Unsupported document format.");
      }

      // Create a temporary browser URL from the authenticated Blob.
      objectUrl = window.URL.createObjectURL(blob);

      // Navigate the already-opened tab to the document.
      newTab.location.replace(objectUrl);

      // The browser owns the Blob URL while displaying it.
      // Do not revoke it immediately, or the document may stop loading.
      objectUrl = null;

    } catch (err) {
      console.error("File opening error:", err);

      if (newTab && !newTab.closed) {
        newTab.close();
      }

      setError(
        err.message ||
        "Unable to open document. Please try again."
      );
    } finally {
      if (objectUrl) {
        window.URL.revokeObjectURL(objectUrl);
      }

      setOpeningId(null);
    }
  };

  // ==========================================
  // UI
  // ==========================================

  return (
    <section className="staff-file-list-section">
      <div className="staff-file-list-heading">
        <div>
          <h2>Client documents</h2>
          <p>{files.length} document(s) available</p>
        </div>

        <button
          type="button"
          className="staff-refresh-button"
          onClick={() => {
            if (typeof onRefresh === "function") {
              onRefresh();
            }
          }}
          disabled={typeof onRefresh !== "function"}
        >
          ↻ Refresh
        </button>
      </div>

      {error && (
        <div className="staff-file-error" role="alert">
          {error}
        </div>
      )}

      {files.length === 0 ? (
        <div className="staff-no-files">
          <div>📁</div>
          <h3>No documents uploaded</h3>
          <p>Uploaded documents will appear here.</p>
        </div>
      ) : (
        <div className="staff-file-table-wrapper">
          <table className="staff-file-table">
            <thead>
              <tr>
                <th>Document</th>
                <th>Type</th>
                <th>Uploaded by</th>
                <th>Upload date</th>
                <th>Size</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {files.map((file) => {
                const fileId = file.id || file._id;

                return (
                  <tr key={fileId}>
                    <td>
                      <div className="staff-file-name">
                        <span>
                          {file.file_type === "PDF" ? "📕" : "🖼️"}
                        </span>

                        <strong>
                          {file.name || "Unnamed document"}
                        </strong>
                      </div>
                    </td>

                    <td>{file.file_type || "Unknown"}</td>

                    <td>
                      {file.uploaded_by?.name || "Unknown"}
                    </td>

                    <td>{formatDate(file.created_at)}</td>

                    <td>{formatSize(file.file_size)}</td>

                    <td>
                      <button
                        type="button"
                        className="staff-file-open-button"
                        onClick={() => handleOpen(file)}
                        disabled={!fileId || openingId === fileId}
                      >
                        {openingId === fileId
                          ? "Opening..."
                          : "Open"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
