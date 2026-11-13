
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import apiRequest from "../../services/api";
import "./PartnerClients.css";

export default function PartnerClients() {
  const navigate = useNavigate();

  // Client data
  const [clients, setClients] = useState([]);
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [search, setSearch] = useState("");

  // UI states
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // ==========================================
  // FETCH CLIENTS
  // ==========================================

  const fetchClients = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await apiRequest("/api/clients");

      setClients(response.clients || []);
    } catch (err) {
      setError(err.message || "Unable to retrieve clients.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  // ==========================================
  // CREATE CLIENT
  // ==========================================

  const createClient = async (event) => {
    event.preventDefault();

    const name = clientName.trim();
    const email = clientEmail.trim().toLowerCase();

    setError("");
    setMessage("");

    if (!name || !email) {
      setError("Please enter the client name and email address.");
      return;
    }

    // Basic email validation
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    try {
      setSaving(true);

      const response = await apiRequest("/api/clients", {
        method: "POST",
        body: JSON.stringify({
          name,
          email
        })
      });

      setMessage(
        response.message || "Client created successfully."
      );

      // Clear form
      setClientName("");
      setClientEmail("");

      // Refresh client list
      await fetchClients();

    } catch (err) {
      setError(err.message || "Unable to create client.");
    } finally {
      setSaving(false);
    }
  };

  // ==========================================
  // SEARCH CLIENTS
  // ==========================================

  const filteredClients = clients.filter((client) => {
    const searchValue = search.toLowerCase();

    return (
      client.name?.toLowerCase().includes(searchValue) ||
      client.email?.toLowerCase().includes(searchValue)
    );
  });

  // ==========================================
  // FORMAT DATE
  // ==========================================

  const formatDate = (date) => {
    if (!date) return "—";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });
  };

  // ==========================================
  // PAGE UI
  // ==========================================

  return (
    <main className="partner-clients">

      {/* HEADER */}

      <header className="pc-header">
        <div>
          <span>PARTNER WORKSPACE</span>
          <h1>Client Management</h1>
          <p>
            Create and manage your firm's client records
            and login email addresses.
          </p>
        </div>

        <button
          type="button"
          className="pc-back-button"
          onClick={() => navigate("/partner/dashboard")}
        >
          ← Dashboard
        </button>
      </header>

      {/* ERROR MESSAGE */}

      {error && (
        <div className="pc-alert error">
          {error}

          <button
            type="button"
            onClick={() => setError("")}
            aria-label="Dismiss error"
          >
            ×
          </button>
        </div>
      )}

      {/* SUCCESS MESSAGE */}

      {message && (
        <div className="pc-alert success">
          {message}

          <button
            type="button"
            onClick={() => setMessage("")}
            aria-label="Dismiss message"
          >
            ×
          </button>
        </div>
      )}

      {/* CREATE CLIENT PANEL */}

      <section className="pc-create-panel">

        <div className="pc-panel-heading">
          <div className="pc-heading-icon">＋</div>

          <div>
            <h2>Create new client</h2>
            <p>
              Add a client name and email address to your firm.
            </p>
          </div>
        </div>

        <form
          onSubmit={createClient}
          className="pc-create-form"
        >

          {/* CLIENT NAME */}

          <div className="pc-form-field">
            <label htmlFor="clientName">
              Client / Business name
            </label>

            <input
              id="clientName"
              type="text"
              placeholder="Enter client name"
              value={clientName}
              onChange={(event) =>
                setClientName(event.target.value)
              }
              maxLength={150}
              required
            />
          </div>

          {/* CLIENT EMAIL */}

          <div className="pc-form-field">
            <label htmlFor="clientEmail">
              Client Gmail / Email address
            </label>

            <input
              id="clientEmail"
              type="email"
              placeholder="client@gmail.com"
              value={clientEmail}
              onChange={(event) =>
                setClientEmail(event.target.value)
              }
              maxLength={254}
              required
            />
          </div>

          {/* SUBMIT */}

          <button
            type="submit"
            disabled={saving}
          >
            {saving ? "Creating..." : "+ Create client"}
          </button>

        </form>
      </section>

      {/* CLIENT LIST */}

      <section className="pc-list-section">

        <div className="pc-list-heading">
          <div>
            <h2>All clients</h2>

            <p>
              {clients.length} client(s) registered in your firm
            </p>
          </div>

          <button
            type="button"
            className="pc-refresh"
            onClick={fetchClients}
            disabled={loading}
          >
            ↻ Refresh
          </button>
        </div>

        {/* SEARCH */}

        <div className="pc-search">
          <span>⌕</span>

          <input
            type="search"
            placeholder="Search by client name or email..."
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
          />
        </div>

        {/* LOADING */}

        {loading ? (
          <div className="pc-empty">
            Loading clients...
          </div>

        ) : filteredClients.length === 0 ? (

          /* EMPTY STATE */

          <div className="pc-empty">
            <div>▤</div>

            <h3>
              {search
                ? "No matching clients"
                : "No clients found"}
            </h3>

            <p>
              {search
                ? "Try another search term."
                : "Create your first client using the form above."}
            </p>
          </div>

        ) : (

          /* CLIENT TABLE */

          <div className="pc-table-wrapper">

            <table className="pc-table">

              <thead>
                <tr>
                  <th>Client</th>
                  <th>Email address</th>
                  <th>Created date</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>

                {filteredClients.map((client) => {
                  const id = client.id || client._id;

                  return (
                    <tr key={id}>

                      {/* NAME */}

                      <td>
                        <div className="pc-client-cell">

                          <div className="pc-client-avatar">
                            {(client.name || "C")
                              .charAt(0)
                              .toUpperCase()}
                          </div>

                          <strong>{client.name}</strong>

                        </div>
                      </td>

                      {/* EMAIL */}

                      <td>
                        {client.email || "Not registered"}
                      </td>

                      {/* DATE */}

                      <td>
                        {formatDate(client.created_at)}
                      </td>

                      {/* STATUS */}

                      <td>
                        <span className="pc-status">
                          {client.is_active === false
                            ? "Inactive"
                            : "Active"}
                        </span>
                      </td>

                      {/* ACTION */}

                      <td>
                        <button
                          type="button"
                          className="pc-assign-button"
                          onClick={() =>
                            navigate(
                              `/partner/assignments?clientId=${encodeURIComponent(id)}`
                            )
                          }
                        >
                          Assign staff →
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

    </main>
  );
}
