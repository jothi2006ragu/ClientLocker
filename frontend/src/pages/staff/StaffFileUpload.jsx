
import { useRef, useState } from "react";
import { uploadClientFile } from "../../services/api";
import "./StaffFileUpload.css";

const MAX_SIZE = 4 * 1024 * 1024;

const ALLOWED_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png"
];

const ALLOWED_EXTENSIONS = ["pdf", "jpg", "jpeg", "png"];

export default function StaffFileUpload({
  clientId,
  onUploadSuccess
}) {
  const inputRef = useRef(null);

  const [file, setFile] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const validateFile = (selectedFile) => {
    if (!selectedFile) {
      return false;
    }

    setError("");
    setSuccess("");

    const extension = selectedFile.name
      .split(".")
      .pop()
      .toLowerCase();

    if (
      !ALLOWED_TYPES.includes(selectedFile.type) ||
      !ALLOWED_EXTENSIONS.includes(extension)
    ) {
      setFile(null);
      setError("Only PDF, JPG and PNG files are allowed.");

      if (inputRef.current) {
        inputRef.current.value = "";
      }

      return false;
    }

    if (selectedFile.size === 0) {
      setFile(null);
      setError("Empty files cannot be uploaded.");

      if (inputRef.current) {
        inputRef.current.value = "";
      }

      return false;
    }

    if (selectedFile.size > MAX_SIZE) {
      setFile(null);
      setError("File size must not exceed 4 MB.");

      if (inputRef.current) {
        inputRef.current.value = "";
      }

      return false;
    }

    setFile(selectedFile);
    return true;
  };

  const handleFileChange = (event) => {
    if (uploading) return;

    validateFile(event.target.files?.[0]);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setDragging(false);

    if (uploading) return;

    validateFile(event.dataTransfer.files?.[0]);
  };

  const handleUpload = async () => {
    if (!file || !clientId) {
      setError("Please select a file.");
      return;
    }

    try {
      setUploading(true);
      setError("");
      setSuccess("");

      const result = await uploadClientFile(clientId, file);

      setSuccess(
        result.message || "File uploaded successfully."
      );

      setFile(null);

      if (inputRef.current) {
        inputRef.current.value = "";
      }

      if (onUploadSuccess) {
        await onUploadSuccess(result.file);
      }
    } catch (err) {
      setError(err.message || "File upload failed.");
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveFile = () => {
    if (uploading) return;

    setFile(null);
    setError("");
    setSuccess("");

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  const formatSize = (size) => {
    if (size < 1024 * 1024) {
      return `${(size / 1024).toFixed(1)} KB`;
    }

    return `${(size / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <section className="staff-upload-section">
      <div className="staff-upload-heading">
        <div>
          <h2>Upload document</h2>
          <p>
            Add a document to this client's private file locker.
          </p>
        </div>
      </div>

      <div
        className={`staff-drop-zone ${dragging ? "dragging" : ""}`}
        onDragOver={(event) => {
          event.preventDefault();

          if (!uploading) {
            setDragging(true);
          }
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => {
          if (!uploading) {
            inputRef.current?.click();
          }
        }}
        role="button"
        tabIndex={uploading ? -1 : 0}
        aria-disabled={uploading}
        onKeyDown={(event) => {
          if (
            !uploading &&
            (event.key === "Enter" || event.key === " ")
          ) {
            event.preventDefault();
            inputRef.current?.click();
          }
        }}
      >
        <div className="staff-upload-icon">↑</div>

        <h3>Drag and drop your file here</h3>
        <p>or click to browse files</p>

        <span>PDF, JPG, PNG · Maximum 4 MB</span>

        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
          hidden
          disabled={uploading}
          onChange={handleFileChange}
        />
      </div>

      {file && (
        <div className="staff-selected-file">
          <div className="staff-selected-icon">📄</div>

          <div className="staff-selected-info">
            <strong>{file.name}</strong>
            <span>{formatSize(file.size)}</span>
          </div>

          <button
            type="button"
            className="staff-remove-file"
            onClick={handleRemoveFile}
            disabled={uploading}
          >
            Remove
          </button>
        </div>
      )}

      {error && (
        <div
          className="staff-upload-message error"
          role="alert"
        >
          {error}
        </div>
      )}

      {success && (
        <div
          className="staff-upload-message success"
          role="status"
        >
          {success}
        </div>
      )}

      <button
        type="button"
        className="staff-upload-button"
        disabled={!file || uploading || !clientId}
        onClick={handleUpload}
      >
        {uploading ? "Uploading..." : "Upload document"}
      </button>
    </section>
  );
}
