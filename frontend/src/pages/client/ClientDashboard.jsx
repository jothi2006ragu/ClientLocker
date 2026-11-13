
import { useCallback, useEffect, useState } from "react";
import {
  ShieldCheck,
  FileText,
  Upload,
  Download,
  RefreshCw,
  LogOut,
  User,
  FolderOpen,
  FileImage,
  AlertCircle,
  CheckCircle2,
  ClipboardList
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";

import {
  getClientFiles,
  uploadClientFile,
  openClientFile,
  openFileInBrowser,
  getClientChecklist,
  updateChecklistItem
} from "../../services/api";

import "./ClientDashboard.css";

function ClientDashboard() {
  const { user, logout } = useAuth();

  const [files, setFiles] = useState([]);
  const [checklist, setChecklist] = useState([]);

  const [loading, setLoading] = useState(true);
  const [checklistLoading, setChecklistLoading] = useState(true);

  const [uploading, setUploading] = useState(false);
  const [openingFile, setOpeningFile] = useState("");
  const [updatingItem, setUpdatingItem] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const clientId = user?.client_id;

  // ==========================================
  // LOAD CLIENT DOCUMENTS
  // ==========================================

  const loadFiles = useCallback(async () => {
    if (!clientId) {
      setError("Your account is not linked to a client record.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const response = await getClientFiles(clientId);

      const receivedFiles =
        Array.isArray(response) ? response :
        Array.isArray(response.files) ? response.files :
        Array.isArray(response.data) ? response.data :
        Array.isArray(response.documents) ? response.documents :
        [];

      setFiles(receivedFiles);
    } catch (err) {
      setError(err.message || "Unable to load your documents.");
    } finally {
      setLoading(false);
    }
  }, [clientId]);

  // ==========================================
  // LOAD CLIENT CHECKLIST
  // ==========================================

  const loadChecklist = useCallback(async () => {
    if (!clientId) {
      setChecklistLoading(false);
      return;
    }

    try {
      setChecklistLoading(true);

      const response = await getClientChecklist(clientId);

      const receivedItems =
        Array.isArray(response) ? response :
        Array.isArray(response.items) ? response.items :
        Array.isArray(response.checklist) ? response.checklist :
        Array.isArray(response.data) ? response.data :
        [];

      setChecklist(receivedItems);
    } catch (err) {
      setError(err.message || "Unable to load your checklist.");
    } finally {
      setChecklistLoading(false);
    }
  }, [clientId]);

  // ==========================================
  // LOAD DASHBOARD DATA
  // ==========================================

  useEffect(() => {
    loadFiles();
    loadChecklist();
  }, [loadFiles, loadChecklist]);

  // ==========================================
  // UPDATE CHECKLIST ITEM
  // ==========================================

  const handleChecklistChange = async (item, done) => {
    const itemId = item._id || item.id;

    if (!itemId) {
      setError("Checklist item ID is missing.");
      return;
    }

    try {
      setUpdatingItem(itemId);
      setError("");
      setSuccess("");

      await updateChecklistItem(itemId, done);

      setChecklist((previousItems) =>
        previousItems.map((currentItem) =>
          (currentItem._id || currentItem.id) === itemId
            ? { ...currentItem, done }
            : currentItem
        )
      );

      setSuccess(
        done
          ? "Checklist item marked as completed."
          : "Checklist item marked as pending."
      );
    } catch (err) {
      setError(err.message || "Unable to update checklist item.");
    } finally {
      setUpdatingItem("");
    }
  };

  // ==========================================
  // UPLOAD DOCUMENT
  // ==========================================

  const handleUpload = async (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    setError("");
    setSuccess("");

    const allowedTypes = [
      "application/pdf",
      "image/jpeg",
      "image/png"
    ];

    if (!allowedTypes.includes(file.type)) {
      setError("Only PDF, JPG and PNG files are allowed.");
      event.target.value = "";
      return;
    }

    if (file.size > 4 * 1024 * 1024) {
      setError("File size must not exceed 4 MB.");
      event.target.value = "";
      return;
    }

    if (!clientId) {
      setError("Your account is not linked to a client record.");
      event.target.value = "";
      return;
    }

    try {
      setUploading(true);

      await uploadClientFile(clientId, file);

      setSuccess("Document uploaded successfully.");

      await loadFiles();
    } catch (err) {
      setError(err.message || "Document upload failed.");
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  };

  // ==========================================
  // TASK 6: SECURE DOCUMENT DOWNLOAD
  // ==========================================

  const handleOpenFile = async (fileId, fileName) => {
    if (!fileId) {
      setError("File ID is missing.");
      return;
    }

    try {
      setOpeningFile(fileId);
      setError("");
      setSuccess("");

      // Backend creates a unique 10-minute link,
      // then retrieves the file using that link.
      const response = await openClientFile(fileId);

      if (!response || !response.blob) {
        throw new Error("Downloaded file data was not returned.");
      }

      // Start the browser download.
      openFileInBrowser(response.blob, fileName);

      setSuccess(
        "Your document download has started."
      );

    } catch (err) {
      console.error("Secure download error:", err);

      setError(
        err.message || "Unable to download this document."
      );
    } finally {
      setOpeningFile("");
    }
  };

  // ==========================================
  // LOGOUT
  // ==========================================

  const handleLogout = () => {
    logout();
  };

  // ==========================================
  // FORMATTING HELPERS
  // ==========================================

  const formatDate = (date) => {
    if (!date) return "Date unavailable";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "Date unavailable";
    }

    return parsedDate.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric"
    });
  };

  const formatSize = (bytes) => {
    if (bytes === undefined || bytes === null) {
      return "—";
    }

    return `${(bytes / 1024).toFixed(1)} KB`;
  };

  const getFileIcon = (file) => {
    const type = file.file_type?.toUpperCase();

    if (type === "JPG" || type === "PNG") {
      return <FileImage size={22} />;
    }

    return <FileText size={22} />;
  };

  const completedCount = checklist.filter(
    (item) => item.done
  ).length;

  const pendingCount = checklist.length - completedCount;

  const completionPercentage =
    checklist.length > 0
      ? Math.round(
          (completedCount / checklist.length) * 100
        )
      : 0;

  // ==========================================
  // DASHBOARD UI
  // ==========================================

  return (
    <div className="client-dashboard">

      {/* HEADER */}
      <header className="client-header">

        <div className="client-brand">

          <div className="client-brand-icon">
            <ShieldCheck size={25} />
          </div>

          <div>
            <h2>ClientLocker</h2>
            <span>Secure Client Portal</span>
          </div>

        </div>

        <button
          className="client-logout"
          onClick={handleLogout}
        >
          <LogOut size={17} />
          Logout
        </button>

      </header>

      <main className="client-main">

        {/* WELCOME */}
        <section className="client-welcome">

          <div>

            <span className="client-eyebrow">
              YOUR SECURE WORKSPACE
            </span>

            <h1>
              Welcome, {user?.name || "Client"}!
            </h1>

            <p>
              Access your documents, track required items
              and securely share files with your accounting team.
            </p>

          </div>

          <div className="client-profile">

            <div className="client-avatar">
              <User size={25} />
            </div>

            <div>
              <strong>{user?.name}</strong>
              <span>{user?.email}</span>
              <small>Client Account</small>
            </div>

          </div>

        </section>

        {/* NOTIFICATIONS */}
        {error && (
          <div className="client-alert client-alert-error">
            <AlertCircle size={19} />
            {error}
          </div>
        )}

        {success && (
          <div className="client-alert client-alert-success">
            <CheckCircle2 size={19} />
            {success}
          </div>
        )}

        {/* CHECKLIST SECTION */}
        <section className="client-checklist-section">

          <div className="client-section-heading">

            <div>

              <span className="client-eyebrow">
                DOCUMENT REQUIREMENTS
              </span>

              <h2>My Checklist</h2>

              <p>
                Track the documents required by your accounting team.
              </p>

            </div>

            <button
              className="client-refresh"
              onClick={loadChecklist}
              disabled={checklistLoading}
            >
              <RefreshCw
                size={17}
                className={
                  checklistLoading ? "client-spinning" : ""
                }
              />
              Refresh
            </button>

          </div>

          {/* CHECKLIST SUMMARY */}
          <div className="client-checklist-summary">

            <div className="client-checklist-stat">

              <ClipboardList size={23} />

              <div>
                <strong>{checklist.length}</strong>
                <span>Total requirements</span>
              </div>

            </div>

            <div className="client-checklist-stat">

              <CheckCircle2 size={23} />

              <div>
                <strong>{completedCount}</strong>
                <span>Completed</span>
              </div>

            </div>

            <div className="client-checklist-stat">

              <AlertCircle size={23} />

              <div>
                <strong>{pendingCount}</strong>
                <span>Pending</span>
              </div>

            </div>

          </div>

          {/* PROGRESS */}
          <div className="client-checklist-progress">

            <div className="client-progress-heading">
              <strong>Completion progress</strong>
              <strong>{completionPercentage}%</strong>
            </div>

            <div className="client-progress-track">

              <div
                className="client-progress-fill"
                style={{
                  width: `${completionPercentage}%`
                }}
              />

            </div>

          </div>

          {/* CHECKLIST ITEMS */}
          <div className="client-checklist-card">

            <div className="client-file-heading">

              <h3>Required Documents</h3>

              <span>
                {completedCount} of {checklist.length} completed
              </span>

            </div>

            {checklistLoading ? (

              <div className="client-empty">

                <RefreshCw
                  className="client-spinning"
                  size={28}
                />

                <p>Loading your checklist...</p>

              </div>

            ) : checklist.length === 0 ? (

              <div className="client-empty">

                <ClipboardList size={42} />

                <h3>No checklist items found</h3>

                <p>
                  Your accounting team has not added any
                  document requirements yet.
                </p>

              </div>

            ) : (

              <div className="client-checklist-list">

                {checklist.map((item) => {

                  const itemId = item._id || item.id;

                  return (
                    <div
                      className={`client-checklist-row ${
                        item.done
                          ? "client-checklist-completed"
                          : ""
                      }`}
                      key={itemId}
                    >

                      <label className="client-checklist-label">

                        <input
                          type="checkbox"
                          checked={Boolean(item.done)}
                          disabled={updatingItem === itemId}
                          onChange={(event) =>
                            handleChecklistChange(
                              item,
                              event.target.checked
                            )
                          }
                        />

                        <span className="client-checklist-name">
                          {item.name}
                        </span>

                      </label>

                      <span
                        className={`client-checklist-status ${
                          item.done
                            ? "status-completed"
                            : "status-pending"
                        }`}
                      >

                        {updatingItem === itemId
                          ? "Updating..."
                          : item.done
                            ? "Completed"
                            : "Pending"}

                      </span>

                    </div>
                  );

                })}

              </div>

            )}

          </div>

        </section>

        {/* DOCUMENT SECTION */}
        <section className="client-documents">

          <div className="client-section-heading">

            <div>

              <span className="client-eyebrow">
                DOCUMENT MANAGEMENT
              </span>

              <h2>My Documents</h2>

              <p>
                View and manage documents securely shared
                with your account.
              </p>

            </div>

            <button
              className="client-refresh"
              onClick={loadFiles}
              disabled={loading}
            >
              <RefreshCw
                size={17}
                className={loading ? "client-spinning" : ""}
              />
              Refresh
            </button>

          </div>

          {/* SUMMARY */}
          <div className="client-summary">

            <div className="client-summary-icon">
              <FolderOpen size={23} />
            </div>

            <div>
              <strong>{files.length}</strong>
              <span>Available documents</span>
            </div>

          </div>

          {/* FILE UPLOAD */}
          <div className="client-upload-card">

            <div className="client-upload-icon">
              <Upload size={25} />
            </div>

            <div className="client-upload-content">

              <h3>Upload a document</h3>

              <p>
                Select a PDF, JPG or PNG document.
                Maximum file size: 4 MB.
              </p>

            </div>

            <label
              className={`client-upload-button ${
                uploading ? "client-button-disabled" : ""
              }`}
            >

              <Upload size={17} />

              {uploading ? "Uploading..." : "Choose file"}

              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
                onChange={handleUpload}
                disabled={uploading || !clientId}
                hidden
              />

            </label>

          </div>

          {/* DOCUMENT LIST */}
          <div className="client-file-card">

            <div className="client-file-heading">

              <h3>Uploaded Documents</h3>

              <span>{files.length} files</span>

            </div>

            {loading ? (

              <div className="client-empty">

                <RefreshCw
                  className="client-spinning"
                  size={28}
                />

                <p>Loading your documents...</p>

              </div>

            ) : files.length === 0 ? (

              <div className="client-empty">

                <FolderOpen size={42} />

                <h3>No documents found</h3>

                <p>
                  Your documents will appear here when they
                  are uploaded to your client account.
                </p>

              </div>

            ) : (

              <div className="client-file-list">

                {files.map((file) => {

                  const fileId = file._id || file.id;

                  return (
                    <div
                      className="client-file-row"
                      key={fileId}
                    >

                      <div className="client-file-info">

                        <div className="client-file-icon">
                          {getFileIcon(file)}
                        </div>

                        <div className="client-file-details">

                          <strong>{file.name}</strong>

                          <span>
                            {file.file_type || "Document"}
                            {" · "}
                            {formatSize(file.file_size)}
                            {" · "}
                            {formatDate(
                              file.created_at || file.createdAt
                            )}
                          </span>

                        </div>

                      </div>

                      <button
                        className="client-open-button"
                        onClick={() =>
                          handleOpenFile(fileId, file.name)
                        }
                        disabled={
                          openingFile === fileId || !fileId
                        }
                      >

                        <Download size={17} />

                        {openingFile === fileId
                          ? "Downloading..."
                          : "Download"}

                      </button>

                    </div>
                  );

                })}

              </div>

            )}

          </div>

        </section>

        {/* FOOTER */}
        <footer className="client-footer">

          <ShieldCheck size={17} />

          <span>
            ClientLocker · Your documents are securely stored.
          </span>

        </footer>

      </main>

    </div>
  );
}

export default ClientDashboard;
