
import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import apiRequest, {
  getClientFiles
} from "../../services/api";

import FileList from "../../components/FileList";

import "../staff/StaffClientDetails.css";

export default function AuditorClientDetails() {
  const { clientId } = useParams();
  const navigate = useNavigate();

  const [client, setClient] = useState(null);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchClientData = useCallback(async () => {
    if (!clientId) {
      setError("Client ID is missing.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      // The backend must return only clients assigned to this auditor.
      const clientResponse = await apiRequest("/api/clients");

      const clients = clientResponse.clients || [];

      const selectedClient = clients.find(
        (item) =>
          String(item.id || item._id) === String(clientId)
      );

      if (!selectedClient) {
        throw new Error(
          "Client not found or you do not have access to this client."
        );
      }

      setClient(selectedClient);

      // Fetch files through the authenticated API.
      const fileResponse = await getClientFiles(clientId);

      setFiles(fileResponse.files || []);
    } catch (err) {
      setError(
        err.message || "Unable to load client information."
      );
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
          onClick={() => navigate("/auditor/dashboard")}
        >
          ← Back to assigned clients
        </button>

        <div className="staff-details-error">
          {error}
        </div>
      </main>
    );
  }

  return (
    <main className="staff-client-details">
      <button
        type="button"
        className="staff-back-button"
        onClick={() => navigate("/auditor/dashboard")}
      >
        ← Back to assigned clients
      </button>

      <header className="staff-client-details-header">
        <div className="staff-client-details-avatar">
          {(client?.name || "C")
            .charAt(0)
            .toUpperCase()}
        </div>

        <div>
          <span>AUDITOR WORKSPACE</span>
          <h1>{client?.name}</h1>
          <p>
            View and securely open documents for this client.
          </p>
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
          <span>Access permission</span>
          <strong className="staff-assigned-label">
            Read only
          </strong>
        </div>
      </div>

      <section className="staff-client-details-layout">
        <div className="staff-details-files-column">
          <div className="auditor-readonly-heading">
            <h2>Client Documents</h2>
            <p>
              You can open documents but cannot upload,
              edit, or delete files.
            </p>
          </div>

          <FileList
            clientId={clientId}
            files={files}
            onRefresh={fetchClientData}
          />
        </div>
      </section>
    </main>
  );
}
