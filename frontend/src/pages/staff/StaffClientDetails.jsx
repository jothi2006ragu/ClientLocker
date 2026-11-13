
import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import apiRequest, {
  getClientFiles
} from "../../services/api";

import StaffFileUpload from "./StaffFileUpload";
import FileList from "../../components/FileList";

import "./StaffClientDetails.css";

export default function StaffClientDetails() {
  const { clientId } = useParams();
  const navigate = useNavigate();

  const [client, setClient] = useState(null);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchClientData = useCallback(async () => {
    if (!clientId) {
      setClient(null);
      setFiles([]);
      setError("Client ID is missing.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");
      setClient(null);
      setFiles([]);

      // Fetch clients available to the logged-in staff member.
      const clientResponse = await apiRequest("/api/clients");

      const clients = Array.isArray(clientResponse.clients)
        ? clientResponse.clients
        : [];

      const selectedClient = clients.find(
        (item) => String(item.id || item._id) === String(clientId)
      );

      if (!selectedClient) {
        throw new Error(
          "Client not found or you do not have access to this client."
        );
      }

      setClient(selectedClient);

      // Fetch files for this client.
      const fileResponse = await getClientFiles(clientId);

      if (!Array.isArray(fileResponse.files)) {
        throw new Error("Unable to read the client's document list.");
      }

      setFiles(fileResponse.files);
    } catch (err) {
      setClient(null);
      setFiles([]);
      setError(err.message || "Unable to load client information.");
    } finally {
      setLoading(false);
    }
  }, [clientId]);

  useEffect(() => {
    fetchClientData();
  }, [fetchClientData]);

  if (loading) {
    return (
      <main className="staff-client-details">
        <div className="staff-details-loading">
          Loading client information...
        </div>
      </main>
    );
  }

  if (error && !client) {
    return (
      <main className="staff-client-details">
        <button
          type="button"
          className="staff-back-button"
          onClick={() => navigate("/staff")}
        >
          ← Back to clients
        </button>

        <div className="staff-details-error">
          {error}
        </div>

        <button
          type="button"
          className="staff-back-button"
          onClick={fetchClientData}
        >
          Try again
        </button>
      </main>
    );
  }

  return (
    <main className="staff-client-details">
      <button
        type="button"
        className="staff-back-button"
        onClick={() => navigate("/staff")}
      >
        ← Back to clients
      </button>

      <header className="staff-client-details-header">
        <div className="staff-client-details-avatar">
          {(client?.name || "C").charAt(0).toUpperCase()}
        </div>

        <div>
          <span>CLIENT WORKSPACE</span>
          <h1>{client?.name}</h1>
          <p>Manage and securely access client documents.</p>
        </div>
      </header>

      {error && (
        <div className="staff-details-error">
          {error}
        </div>
      )}

      <div className="staff-details-stats">
        <div>
          <span>Documents</span>
          <strong>{files.length}</strong>
        </div>

        <div>
          <span>Client status</span>
          <strong className="staff-assigned-label">
            Assigned
          </strong>
        </div>
      </div>

      <div className="staff-client-details-layout">
        <div className="staff-details-upload-column">
          <StaffFileUpload
            clientId={clientId}
            onUploadSuccess={fetchClientData}
          />
        </div>

        <div className="staff-details-files-column">
          <FileList
            clientId={clientId}
            files={files}
            onRefresh={fetchClientData}
          />
        </div>
      </div>
    </main>
  );
}
