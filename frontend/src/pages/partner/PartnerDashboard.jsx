
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, Link, NavLink } from "react-router-dom";
import {
  FolderLock,
  Plus,
  Search,
  ArrowRight,
  ShieldCheck,
  HardDrive,
  Activity,
  FileText,
  UserCheck,
  UserX,
  ShieldAlert,
  Clock,
  ExternalLink,
  Users,
  CheckCircle2,
  RefreshCw,
  X,
  LogOut
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import apiRequest from "../../services/api";
import "./PartnerDashboard.css";

export default function PartnerDashboard() {
  const navigate = useNavigate();

  // Authentication
  const { logout } = useAuth();

  const [clients, setClients] = useState([]);
  const [staff, setStaff] = useState([]);
  const [activityLogs, setActivityLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // New Space Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [newSpaceName, setNewSpaceName] = useState("");
  const [newSpaceEmail, setNewSpaceEmail] = useState("");
  const [modalSubmitting, setModalSubmitting] = useState(false);
  const [modalError, setModalError] = useState("");
  const [modalSuccess, setModalSuccess] = useState("");

  // ==========================================
  // LOGOUT
  // ==========================================

  const handleLogout = () => {
    logout();

    navigate("/login", {
      replace: true
    });
  };

  // ==========================================
  // FETCH ALL DATA
  // ==========================================

  const loadDashboardData = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const [clientRes, staffRes, activityRes] = await Promise.all([
        apiRequest("/api/clients").catch(() => ({ clients: [] })),
        apiRequest("/api/staff").catch(() => ({ staff: [] })),
        apiRequest("/api/activity").catch(() => ({ activity: [] }))
      ]);

      setClients(clientRes.clients || []);
      setStaff(staffRes.staff || []);

      const logs = activityRes.activity || activityRes.logs || [];

      setActivityLogs(logs.slice(0, 8));
    } catch (err) {
      setError(err.message || "Unable to load dashboard data.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // ==========================================
  // CREATE NEW CLIENT SPACE
  // ==========================================

  const handleCreateSpace = async (e) => {
    e.preventDefault();

    setModalError("");
    setModalSuccess("");

    const name = newSpaceName.trim();
    const email = newSpaceEmail.trim().toLowerCase();

    if (!name || !email) {
      setModalError(
        "Please provide both a client space name and primary email."
      );
      return;
    }

    try {
      setModalSubmitting(true);

      const res = await apiRequest("/api/clients", {
        method: "POST",
        body: JSON.stringify({ name, email })
      });

      setModalSuccess(
        res.message || "Client space created successfully."
      );

      setNewSpaceName("");
      setNewSpaceEmail("");

      await loadDashboardData(true);

      setTimeout(() => {
        setModalOpen(false);
        setModalSuccess("");
      }, 1200);

    } catch (err) {
      setModalError(
        err.message || "Failed to create client space."
      );
    } finally {
      setModalSubmitting(false);
    }
  };

  // ==========================================
  // FILTER CLIENTS
  // ==========================================

  const filteredClients = useMemo(() => {
    if (!searchQuery.trim()) return clients;

    const q = searchQuery.toLowerCase();

    return clients.filter((c) =>
      c.name?.toLowerCase().includes(q)
    );
  }, [clients, searchQuery]);

  // ==========================================
  // FORMAT TIME
  // ==========================================

  const formatTimeAgo = (timestamp) => {
    if (!timestamp) return "recently";

    const elapsed = Math.floor(
      (Date.now() - new Date(timestamp).getTime()) / 1000
    );

    if (elapsed < 60) return "just now";

    if (elapsed < 3600) {
      return `${Math.floor(elapsed / 60)}m ago`;
    }

    if (elapsed < 86400) {
      return `${Math.floor(elapsed / 3600)}h ago`;
    }

    return `${Math.floor(elapsed / 86400)}d ago`;
  };

  // ==========================================
  // ACTIVITY STYLING
  // ==========================================

  const getActivityBullet = (action, blocked) => {
    if (blocked) return "ruby";
    if (action === "FILE_UPLOADED") return "emerald";
    if (action === "FILE_OPENED") return "cyan";
    if (action?.includes("ACCESS")) return "indigo";

    return "cyan";
  };

  // ==========================================
  // ACTIVITY TEXT
  // ==========================================

  const formatActivityText = (log) => {
    const actor = log.person_id?.name || "System";
    const client = log.client_id?.name || "client space";
    const file = log.file_id?.name || "document";

    if (log.blocked) {
      return `Blocked unauthorized access attempt by ${actor} on ${client}`;
    }

    switch (log.action) {
      case "FILE_UPLOADED":
        return `${actor} uploaded ${file} to ${client}`;

      case "FILE_OPENED":
        return `${actor} opened ${file} in ${client}`;

      case "ACCESS_GRANTED":
        return `Access granted for ${actor} to ${client}`;

      case "ACCESS_REMOVED":
        return `Access revoked for ${actor} on ${client}`;

      default:
        return `${actor} performed ${log.action?.toLowerCase()} on ${client}`;
    }
  };

  // ==========================================
  // DASHBOARD UI
  // ==========================================

  return (
    <>
      <aside className="partner-control-sidebar" aria-label="Partner navigation">
        <div className="partner-control-brand">
          <div className="partner-control-brand-icon"><FolderLock size={21} /></div>
          <div className="partner-control-brand-copy">
            <strong>ClientLocker</strong>
            <span>Partner workspace</span>
          </div>
        </div>

        <div className="partner-control-label">Workspace</div>
        <nav className="partner-control-nav">
          <NavLink to="/partner/dashboard" end className={({ isActive }) => `partner-control-link${isActive ? " active" : ""}`} title="Overview">
            <Activity size={18} /><span>Overview</span>
          </NavLink>
          <NavLink to="/partner/clients" className={({ isActive }) => `partner-control-link${isActive ? " active" : ""}`} title="Client Spaces">
            <Users size={18} /><span>Client Spaces</span>
          </NavLink>
          <NavLink to="/partner/assignments" className={({ isActive }) => `partner-control-link${isActive ? " active" : ""}`} title="Access Management">
            <ShieldCheck size={18} /><span>Access Management</span>
          </NavLink>
          <NavLink to="/partner/activity" className={({ isActive }) => `partner-control-link${isActive ? " active" : ""}`} title="Activity Log">
            <FileText size={18} /><span>Activity Log</span>
          </NavLink>
        </nav>

        <div className="partner-control-sidebar-bottom">
          <strong>Secure client workspace</strong><br />
          Manage client files and permissions from one place.
        </div>
      </aside>

      <main className="partner-spaces-page partner-with-sidebar">

      {/* ======================================
          DASHBOARD HEADER
      ====================================== */}

      <header className="partner-spaces-topbar">

        <div>
          <span className="locker-eyebrow">
            CLIENTLOCKER / PARTNER WORKSPACE
          </span>

          <h1 className="partner-spaces-title">
            Client spaces
          </h1>

          <p className="partner-spaces-subtitle">
            Each client gets their own space. Put everything in one place for each client.
          </p>
        </div>

        <div className="partner-topbar-actions">

          {/* REFRESH */}

          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => loadDashboardData(true)}
            disabled={loading || refreshing}
            title="Refresh spaces"
          >
            <RefreshCw
              size={14}
              className={refreshing ? "spinner" : ""}
            />

            <span>Refresh</span>
          </button>

          {/* NEW SPACE */}

          <button
            type="button"
            className="btn btn-primary"
            onClick={() => setModalOpen(true)}
          >
            <Plus size={16} />
            <span>New space</span>
          </button>

          {/* LOGOUT */}

          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleLogout}
            title="Logout from ClientLocker"
          >
            <LogOut size={16} />
            <span>Logout</span>
          </button>

        </div>
      </header>

      {/* ======================================
          ERROR ALERT
      ====================================== */}

      {error && (
        <div
          className="locker-alert-banner"
          role="alert"
        >
          <span>{error}</span>

          <button
            type="button"
            onClick={() => loadDashboardData(true)}
          >
            Retry
          </button>
        </div>
      )}

      {/* ======================================
          DASHBOARD LAYOUT
      ====================================== */}

      <div className="locker-dashboard-layout">

        {/* ==================================
            LEFT COLUMN: CLIENT SPACES
        ================================== */}

        <section className="locker-spaces-column">

          {/* SEARCH */}

          <div className="locker-search-bar">

            <Search
              size={16}
              className="locker-search-icon"
            />

            <input
              type="text"
              placeholder="Search spaces by client name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="locker-search-input"
            />

            {searchQuery && (
              <button
                type="button"
                className="locker-clear-search"
                onClick={() => setSearchQuery("")}
              >
                Clear
              </button>
            )}

          </div>

          {/* CLIENT SPACES LIST */}

          <div className="locker-spaces-list">

            {loading ? (

              Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="locker-space-card skeleton-card"
                >
                  <div className="skeleton space-avatar-skeleton" />

                  <div className="space-info-skeleton">
                    <div className="skeleton title-skeleton" />
                    <div className="skeleton sub-skeleton" />
                  </div>

                  <div className="skeleton button-skeleton" />
                </div>
              ))

            ) : filteredClients.length === 0 ? (

              <div className="locker-empty-state">

                <FolderLock
                  size={36}
                  className="empty-icon"
                />

                <h3>No client spaces found</h3>

                <p>
                  {searchQuery
                    ? `No spaces matching "${searchQuery}"`
                    : "No client spaces have been initialized yet."}
                </p>

                {searchQuery ? (

                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setSearchQuery("")}
                  >
                    Clear search
                  </button>

                ) : (

                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => setModalOpen(true)}
                  >
                    <Plus size={14} />
                    Create your first space
                  </button>

                )}

              </div>

            ) : (

              filteredClients.map((client, index) => {

                const clientId = client.id || client._id;

                const clientInitial = client.name
                  ? client.name.charAt(0).toUpperCase()
                  : "C";

                return (
                  <motion.div
                    key={clientId}
                    className="locker-space-card"
                    initial={{
                      opacity: 0,
                      y: 8
                    }}
                    animate={{
                      opacity: 1,
                      y: 0
                    }}
                    transition={{
                      duration: 0.22,
                      delay: Math.min(index * 0.04, 0.3),
                      ease: [0.23, 1, 0.32, 1]
                    }}
                  >

                    <div className="space-card-left">

                      <div className="space-avatar">
                        <span>{clientInitial}</span>
                      </div>

                      <div className="space-details">

                        <h3 className="space-name">
                          {client.name}
                        </h3>

                        <div className="space-metadata">

                          <span className="space-meta-item">
                            Vault space active
                          </span>

                          <span className="meta-separator">
                            •
                          </span>

                          <span className="space-meta-item">
                            Expiring 10m links
                          </span>

                        </div>

                      </div>

                    </div>

                    <div className="space-card-actions">

                      <button
                        type="button"
                        className="space-open-btn"
                        onClick={() =>
                          navigate(`/staff/clients/${clientId}`)
                        }
                        title={`Open ${client.name}'s document space`}
                      >
                        <span>Open</span>
                        <ArrowRight size={14} />
                      </button>

                    </div>

                  </motion.div>
                );

              })

            )}

          </div>

        </section>


        {/* ==================================
            RIGHT COLUMN
        ================================== */}

        <aside className="locker-side-column">

          {/* FIRM STORAGE CARD */}

          <div className="locker-side-card">

            <div className="side-card-header">

              <span className="side-card-title">
                Firm plan
              </span>

              <span className="badge-pill emerald">
                Active
              </span>

            </div>

            <div className="storage-metric-block">

              <div className="storage-metric-title">

                <strong>Storage quota</strong>

                <span>16.4 MB of 1 GB</span>

              </div>

              <div className="storage-progress-track">

                <div
                  className="storage-progress-fill"
                  style={{
                    width: `${Math.min(
                      (clients.length / 20) * 100,
                      100
                    )}%`
                  }}
                />

              </div>

              <div className="storage-metric-sub">

                <span>
                  {clients.length} of 25 client spaces allocated
                </span>

              </div>

            </div>

            <p className="storage-card-note">
              Firm plan includes the full private storage model and instant revocation tracking across all spaces.
            </p>

          </div>


          {/* ACTIVITY CARD */}

          <div className="locker-side-card">

            <div className="side-card-header">

              <div>
                <span className="side-card-title">
                  Activity
                </span>

                <p className="side-card-sub">
                  Every view, download and upload per file
                </p>
              </div>

            </div>

            <div className="activity-feed-list">

              {loading ? (

                Array.from({ length: 4 }).map((_, i) => (
                  <div
                    key={i}
                    className="activity-item-skeleton"
                  >
                    <div className="skeleton bullet-skeleton" />
                    <div className="skeleton line-skeleton" />
                  </div>
                ))

              ) : activityLogs.length === 0 ? (

                <div className="activity-empty">
                  <span>No security events recorded yet.</span>
                </div>

              ) : (

                activityLogs.map((log) => {

                  const bulletColor = getActivityBullet(
                    log.action,
                    log.blocked
                  );

                  const timeAgo = formatTimeAgo(log.created_at);

                  const text = formatActivityText(log);

                  return (
                    <div
                      key={log._id || log.id}
                      className="activity-feed-item"
                    >

                      <span
                        className={`status-dot ${bulletColor}`}
                      />

                      <div className="activity-content">

                        <p className="activity-text">
                          {text}
                        </p>

                        <span className="activity-timestamp">
                          {timeAgo}
                        </span>

                      </div>

                    </div>
                  );

                })

              )}

            </div>

            <div className="side-card-footer">

              <Link
                to="/partner/activity"
                className="activity-view-all"
              >
                <span>View full audit log</span>
                <ArrowRight size={13} />
              </Link>

            </div>

          </div>

        </aside>

      </div>


      {/* ======================================
          NEW CLIENT SPACE MODAL
      ====================================== */}

      <AnimatePresence>

        {modalOpen && (

          <div className="modal-backdrop">

            <motion.div
              className="modal-card"
              initial={{
                opacity: 0,
                scale: 0.96,
                y: 10
              }}
              animate={{
                opacity: 1,
                scale: 1,
                y: 0
              }}
              exit={{
                opacity: 0,
                scale: 0.96,
                y: 8
              }}
              transition={{
                duration: 0.2,
                ease: [0.23, 1, 0.32, 1]
              }}
            >

              <div className="modal-header">

                <div>

                  <span className="locker-eyebrow">
                    NEW CLIENT SPACE
                  </span>

                  <h2>Create client space</h2>

                  <p>
                    Initialize a private document locker for an accounting client.
                  </p>

                </div>

                <button
                  type="button"
                  className="modal-close-btn"
                  onClick={() => setModalOpen(false)}
                >
                  <X size={18} />
                </button>

              </div>


              <form
                onSubmit={handleCreateSpace}
                className="modal-form"
              >

                <div className="form-group">

                  <label htmlFor="spaceName">
                    Business or Client Name
                  </label>

                  <input
                    id="spaceName"
                    type="text"
                    className="input-base"
                    placeholder="e.g. Pandian Exports"
                    value={newSpaceName}
                    onChange={(e) =>
                      setNewSpaceName(e.target.value)
                    }
                    required
                    disabled={modalSubmitting}
                  />

                </div>


                <div className="form-group">

                  <label htmlFor="spaceEmail">
                    Primary Client Email
                  </label>

                  <input
                    id="spaceEmail"
                    type="email"
                    className="input-base"
                    placeholder="e.g. finance@example.com"
                    value={newSpaceEmail}
                    onChange={(e) =>
                      setNewSpaceEmail(e.target.value)
                    }
                    required
                    disabled={modalSubmitting}
                  />

                </div>


                {modalError && (
                  <div className="form-message error">
                    {modalError}
                  </div>
                )}

                {modalSuccess && (
                  <div className="form-message success">
                    {modalSuccess}
                  </div>
                )}


                <div className="modal-actions">

                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setModalOpen(false)}
                    disabled={modalSubmitting}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={modalSubmitting}
                  >
                    {modalSubmitting
                      ? "Creating..."
                      : "Create Space"}
                  </button>

                </div>

              </form>

            </motion.div>

          </div>

        )}

      </AnimatePresence>

      </main>
    </>
  );
}
