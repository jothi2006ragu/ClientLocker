
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import apiRequest from "../../services/api";
import "./AuditorDashboard.css";

export default function AuditorDashboard() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchClients = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const data = await apiRequest("/api/clients");

      if (!data || !Array.isArray(data.clients)) {
        throw new Error("Invalid client list received from server.");
      }

      // The backend enforces the auditor's assigned-client limit.
      setClients(data.clients);
    } catch (err) {
      setError(err.message || "Unable to load assigned clients.");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const handleViewDocuments = (client) => {
    const clientId = client.id || client._id;

    if (!clientId) {
      setError("Unable to open this client. Client ID is missing.");
      return;
    }

    navigate(`/auditor/clients/${clientId}`);
  };

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  return (
    <main className="auditor-dashboard">
      <header className="auditor-header">
        <div className="auditor-header-content">
          <span className="auditor-eyebrow">
            CLIENTLOCKER / AUDITOR WORKSPACE
          </span>

          <h1>Auditor Dashboard</h1>

          <p>
            View and review documents for your assigned clients.
          </p>
        </div>

        <div className="auditor-header-actions">
          <div className="auditor-header-count">
            <span>{clients.length}</span>
            <small>Assigned clients</small>
          </div>

          <button
            type="button"
            className="auditor-logout-btn"
            onClick={handleLogout}
          >
            <span>↪</span>
            Logout
          </button>
        </div>
      </header>

      <section className="auditor-summary-grid">
        <article className="auditor-summary-card">
          <div className="auditor-summary-icon">🏢</div>
          <div>
            <span>Assigned clients</span>
            <h2>{clients.length}</h2>
          </div>
        </article>

        <article className="auditor-summary-card">
          <div className="auditor-summary-icon">🔒</div>
          <div>
            <span>Access permission</span>
            <h2 className="auditor-readonly-label">
              Read only
            </h2>
          </div>
        </article>
      </section>

      <section className="auditor-client-section">
        <div className="auditor-section-heading">
          <div>
            <span className="auditor-section-eyebrow">
              YOUR WORKSPACE
            </span>

            <h2>My Assigned Clients</h2>

            <p>
              Select a client to view their available documents.
            </p>
          </div>

          <span className="auditor-client-total">
            {clients.length}{" "}
            {clients.length === 1 ? "Client" : "Clients"}
          </span>
        </div>

        {loading && (
          <div className="auditor-state">
            <div className="auditor-spinner" />
            <p>Loading your assigned clients...</p>
          </div>
        )}

        {!loading && error && (
          <div className="auditor-error">
            <strong>Unable to load clients</strong>
            <p>{error}</p>

            <button
              type="button"
              onClick={fetchClients}
            >
              Try again
            </button>
          </div>
        )}

        {!loading && !error && clients.length === 0 && (
          <div className="auditor-empty">
            <div className="auditor-empty-icon">📁</div>

            <h3>No clients assigned</h3>

            <p>
              You currently do not have access to any client
              records. Please contact your partner.
            </p>
          </div>
        )}

        {!loading && !error && clients.length > 0 && (
          <div className="auditor-client-grid">
            {clients.map((client) => {
              const clientId = client.id || client._id;

              return (
                <article
                  className="auditor-client-card"
                  key={clientId}
                >
                  <div className="auditor-card-top">
                    <div className="auditor-client-avatar">
                      {(client.name || "C")
                        .charAt(0)
                        .toUpperCase()}
                    </div>

                    <span className="auditor-assigned-badge">
                      <span className="auditor-status-dot" />
                      Assigned
                    </span>
                  </div>

                  <h3>
                    {client.name || "Unnamed client"}
                  </h3>

                  <p className="auditor-client-description">
                    Review and view client documents.
                  </p>

                  <div className="auditor-card-divider" />

                  <div className="auditor-card-permission">
                    <span>Permission</span>

                    <strong>
                      <span>👁</span> View &amp; Open
                    </strong>
                  </div>

                  <button
                    type="button"
                    className="auditor-view-btn"
                    disabled={!clientId}
                    onClick={() => handleViewDocuments(client)}
                  >
                    View Documents
                    <span>→</span>
                  </button>
                </article>
              );
            })}
          </div>
        )}
      </section>

      <footer className="auditor-access-notice">
        <span className="auditor-notice-icon">🛡️</span>

        <div>
          <strong>Read-only access</strong>

          <p>
            You can view and open documents for your assigned
            clients. Uploading, editing, deleting, and changing
            access are not permitted.
          </p>
        </div>
      </footer>
    </main>
  );
}
