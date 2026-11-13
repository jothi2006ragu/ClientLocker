import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  ShieldCheck,
  Menu,
  X,
  ArrowRight,
  ChevronRight,
  LogOut,
  LayoutDashboard,
  Sparkles
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import "./Navbar.css";

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  const { user, isAuthenticated, logout } = useAuth();

  // Treat either an authenticated context state or a populated user
  // as a signed-in session. The user object is maintained by AuthContext.
  const isLoggedIn = Boolean(isAuthenticated || user);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    handleScroll();

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Close the mobile drawer after route changes.
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  const closeMenu = () => setMenuOpen(false);

  const isActive = (path) => location.pathname === path;

  const getDashboardPath = () => {
    switch (user?.role) {
      case "partner":
        return "/partner/dashboard";
      case "staff":
        return "/staff/dashboard";
      case "client":
        return "/client/dashboard";
      case "auditor":
        return "/auditor/dashboard";
      default:
        return "/dashboard";
    }
  };

  const handleLogout = async () => {
    closeMenu();

    try {
      await logout();
    } finally {
      navigate("/login", { replace: true });
    }
  };

  const firstName = user?.name
    ? user.name.trim().split(/\s+/)[0]
    : "My account";

  const roleName = user?.role
    ? user.role.charAt(0).toUpperCase() + user.role.slice(1)
    : "";

  return (
    <header className={`cl-navbar ${scrolled ? "scrolled" : ""}`}>
      <div className="cl-navbar-glow" aria-hidden="true" />

      <div className="cl-navbar-container">
        {/* Brand */}
        <Link
          to="/"
          className="cl-brand"
          onClick={closeMenu}
          aria-label="ClientLocker Home"
        >
          <div className="cl-brand-emblem">
            <ShieldCheck size={20} className="cl-shield-icon" />
            <div className="cl-brand-pulse" />
          </div>

          <div className="cl-brand-text-group">
            <span className="cl-brand-title">
              Client<span className="accent">Locker</span>
            </span>
            <span className="cl-brand-sub">
              Vaigai Vel &amp; Associates
            </span>
          </div>
        </Link>

        {/* Desktop navigation */}
        <nav className="cl-nav-links" aria-label="Main navigation">
          <Link
            to="/"
            className={`cl-nav-link ${isActive("/") ? "active" : ""}`}
          >
            Home
          </Link>

          <a href="/#features" className="cl-nav-link">
            Features
          </a>

          <a href="/#security" className="cl-nav-link">
            Security
          </a>

          <a href="/#how-it-works" className="cl-nav-link">
            Architecture
          </a>

          <Link
            to="/about"
            className={`cl-nav-link ${isActive("/about") ? "active" : ""}`}
          >
            About
          </Link>
        </nav>

        {/* Desktop actions */}
        <div className="cl-navbar-actions">
          {isLoggedIn ? (
            <div className="cl-user-pill">
              <Link
                to={getDashboardPath()}
                className="cl-dashboard-link"
                onClick={closeMenu}
                title="Open your workspace"
              >
                <LayoutDashboard size={16} />

                <span className="cl-user-name">
                  {firstName}
                </span>

                {roleName && (
                  <span className={`cl-role-badge ${user?.role || ""}`}>
                    {roleName}
                  </span>
                )}
              </Link>

              <button
                type="button"
                className="cl-logout-btn"
                onClick={handleLogout}
                title="Sign out of ClientLocker"
                aria-label="Sign out"
              >
                <LogOut size={15} />
                <span>Logout</span>
              </button>
            </div>
          ) : (
            <div className="cl-auth-buttons">
              <Link
                to="/client/login"
                className="cl-magic-link-btn"
                title="Client Magic Link Login"
              >
                <Sparkles size={14} />
                <span>Magic Link</span>
              </Link>

              <Link to="/login" className="btn btn-primary cl-login-btn">
                <span>Sign In</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          )}

          {/* Mobile menu button */}
          <button
            type="button"
            className="cl-menu-toggle"
            onClick={() => setMenuOpen((previous) => !previous)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div
              className="cl-mobile-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={closeMenu}
            />

            <motion.nav
              className="cl-mobile-drawer"
              initial={{ opacity: 0, y: -20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -15, scale: 0.98 }}
              transition={{
                duration: 0.22,
                ease: [0.23, 1, 0.32, 1]
              }}
              aria-label="Mobile navigation"
            >
              <div className="cl-mobile-links">
                <Link
                  to="/"
                  className={`cl-mobile-link ${
                    isActive("/") ? "active" : ""
                  }`}
                  onClick={closeMenu}
                >
                  <span>Home</span>
                  <ChevronRight size={16} />
                </Link>

                <a
                  href="/#features"
                  className="cl-mobile-link"
                  onClick={closeMenu}
                >
                  <span>Features</span>
                  <ChevronRight size={16} />
                </a>

                <a
                  href="/#security"
                  className="cl-mobile-link"
                  onClick={closeMenu}
                >
                  <span>Security</span>
                  <ChevronRight size={16} />
                </a>

                <a
                  href="/#how-it-works"
                  className="cl-mobile-link"
                  onClick={closeMenu}
                >
                  <span>Architecture</span>
                  <ChevronRight size={16} />
                </a>

                <Link
                  to="/about"
                  className={`cl-mobile-link ${
                    isActive("/about") ? "active" : ""
                  }`}
                  onClick={closeMenu}
                >
                  <span>About</span>
                  <ChevronRight size={16} />
                </Link>
              </div>

              <div className="cl-mobile-footer-actions">
                {isLoggedIn ? (
                  <>
                    <Link
                      to={getDashboardPath()}
                      className="btn btn-primary"
                      onClick={closeMenu}
                      style={{ width: "100%" }}
                    >
                      <LayoutDashboard size={16} />
                      Open {roleName || "User"} Workspace
                    </Link>

                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={handleLogout}
                      style={{ width: "100%", marginTop: "8px" }}
                    >
                      <LogOut size={16} />
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/login"
                      className="btn btn-primary"
                      onClick={closeMenu}
                      style={{ width: "100%" }}
                    >
                      <span>Sign In to Portal</span>
                      <ArrowRight size={16} />
                    </Link>

                    <Link
                      to="/client/login"
                      className="btn btn-secondary"
                      onClick={closeMenu}
                      style={{ width: "100%", marginTop: "8px" }}
                    >
                      <Sparkles size={16} />
                      Client Magic Link
                    </Link>
                  </>
                )}
              </div>
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}

export default Navbar;
