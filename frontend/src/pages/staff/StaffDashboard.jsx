
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import apiRequest from "../../services/api";
import "./StaffDashboard.css";

export default function StaffDashboard() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Logout
  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  // Fetch assigned clients
  const fetchClients = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const data = await apiRequest("/api/clients");

      if (!Array.isArray(data.clients)) {
        throw new Error("Invalid client list received from server.");
      }

      setClients(data.clients);
    } catch (err) {
      setClients([]);
      setError(err.message || "Unable to load clients.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  return (
    <main className="staff-dashboard">

      {/* HEADER */}
      <header className="staff-header">
        <div className="staff-header-content">
          <span className="staff-eyebrow">WORKSPACE</span>
          <h1>My Clients</h1>
          <p>Manage your assigned clients and their documents.</p>
        </div>

        <div className="staff-header-actions">
          <div className="staff-header-count">
            <span>{clients.length}</span>
            <small>Assigned clients</small>
          </div>

          <button
            type="button"
            className="staff-logout-btn"
            onClick={handleLogout}
          >
            <span className="staff-logout-icon">↪</span>
            Logout
          </button>
        </div>
      </header>

      {/* SUMMARY */}
      <section className="staff-summary">
        <div className="staff-summary-icon">👥</div>

        <div>
          <span>Total assigned clients</span>
          <h2>{clients.length}</h2>
        </div>
      </section>

      {/* CLIENT SECTION */}
      <section className="staff-client-section">
        <div className="staff-section-heading">
          <div>
            <h2>Assigned clients</h2>
            <p>Select a client to manage their documents.</p>
          </div>
        </div>

        {loading && (
          <div className="staff-state">
            Loading your clients...
          </div>
        )}

        {!loading && error && (
          <div className="staff-error" role="alert">
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
          <div className="staff-empty">
            <div className="staff-empty-icon">📂</div>
            <h3>No clients assigned</h3>
            <p>Contact your partner to get client access.</p>
          </div>
        )}

        {!loading && !error && clients.length > 0 && (
          <div className="staff-client-grid">
            {clients.map((client) => {
              const clientId = client.id || client._id;

              if (!clientId) {
                return null;
              }

              return (
                <article
                  className="staff-client-card"
                  key={clientId}
                >
                  <div className="staff-card-top">
                    <div className="staff-client-avatar">
                      {(client.name || "C")
                        .charAt(0)
                        .toUpperCase()}
                    </div>

                    <span className="staff-client-status">
                      Assigned
                    </span>
                  </div>

                  <h3>{client.name || "Unnamed client"}</h3>

                  <p className="staff-client-description">
                    Client document management
                  </p>

                  <button
                    type="button"
                    className="staff-open-client"
                    onClick={() =>
                      navigate(`/staff/clients/${clientId}`)
                    }
                  >
                    View client
                    <span>→</span>
                  </button>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
