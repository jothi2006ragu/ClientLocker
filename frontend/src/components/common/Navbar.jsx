import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FolderLock, Menu, X, ArrowRight, ShieldCheck, ChevronRight } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import "./Navbar.css";

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const closeMenu = () => setMenuOpen(false);

  const isActive = (path) => {
    if (path === "/") {
      return location.pathname === "/" && !location.hash;
    }
    return location.pathname === path;
  };

  const handleSectionClick = (sectionId) => (e) => {
    closeMenu();
    if (location.pathname === "/") {
      e.preventDefault();
      const el = document.getElementById(sectionId);
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
      }
    } else {
      navigate(`/#${sectionId}`);
    }
  };

  return (
    <header className={`main-navbar ${scrolled ? "scrolled" : ""}`}>
      <div className="navbar-container">
        {/* Brand */}
        <Link
          to="/"
          className="navbar-brand"
          onClick={closeMenu}
          aria-label="ClientLocker Home"
        >
          <div className="navbar-brand-icon-wrapper">
            <span className="navbar-brand-icon">
              <FolderLock size={22} strokeWidth={2.4} />
            </span>
            <span className="navbar-brand-shield-dot">
              <ShieldCheck size={10} strokeWidth={3} />
            </span>
          </div>

          <div className="navbar-brand-text-group">
            <span className="navbar-brand-text">
              Client<span className="brand-accent">Locker</span>
            </span>
            <span className="navbar-brand-sub">Vaigai Vel &amp; Associates</span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="navbar-desktop-links" aria-label="Main navigation">
          <Link
            to="/"
            className={`nav-link ${isActive("/") ? "active" : ""}`}
          >
            <span>Home</span>
            {isActive("/") && (
              <motion.span
                className="nav-active-indicator"
                layoutId="navActiveIndicator"
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}
          </Link>

          <Link
            to="/about"
            className={`nav-link ${isActive("/about") ? "active" : ""}`}
          >
            <span>About</span>
            {isActive("/about") && (
              <motion.span
                className="nav-active-indicator"
                layoutId="navActiveIndicator"
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}
          </Link>

          <a
            href="/#features"
            onClick={handleSectionClick("features")}
            className="nav-link"
          >
            <span>Features</span>
          </a>

          <a
            href="/#how-it-works"
            onClick={handleSectionClick("how-it-works")}
            className="nav-link"
          >
            <span>How It Works</span>
          </a>

          <a
            href="/#contact"
            onClick={handleSectionClick("contact")}
            className="nav-link"
          >
            <span>Contact</span>
          </a>

          <div className="nav-divider" />

          <Link to="/login" className="navbar-login-btn">
            <span>Sign In</span>
            <ArrowRight size={16} strokeWidth={2.4} className="login-btn-icon" />
          </Link>
        </nav>

        {/* Mobile Menu Button */}
        <button
          type="button"
          className="navbar-menu-toggle"
          onClick={() => setMenuOpen((previous) => !previous)}
          aria-label={menuOpen ? "Close navigation" : "Open navigation"}
          aria-expanded={menuOpen}
          aria-controls="mobile-navigation"
        >
          {menuOpen ? <X size={22} strokeWidth={2.4} /> : <Menu size={22} strokeWidth={2.4} />}
        </button>
      </div>

      {/* Mobile Navigation Drawer */}
      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div
              className="navbar-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={closeMenu}
            />

            <motion.nav
              id="mobile-navigation"
              className="navbar-mobile-menu"
              aria-label="Mobile navigation"
              initial={{ opacity: 0, y: -12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -12, scale: 0.98 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="mobile-firm-banner">
                <span className="mobile-firm-pill">Client Portal</span>
                <span className="mobile-firm-name">Vaigai Vel &amp; Associates</span>
              </div>

              <div className="mobile-links-list">
                <Link
                  to="/"
                  className={`mobile-nav-link ${isActive("/") ? "active" : ""}`}
                  onClick={closeMenu}
                >
                  <span>Home</span>
                  <ChevronRight size={16} className="mobile-link-arrow" />
                </Link>

                <Link
                  to="/about"
                  className={`mobile-nav-link ${isActive("/about") ? "active" : ""}`}
                  onClick={closeMenu}
                >
                  <span>About</span>
                  <ChevronRight size={16} className="mobile-link-arrow" />
                </Link>

                <a
                  href="/#features"
                  className="mobile-nav-link"
                  onClick={handleSectionClick("features")}
                >
                  <span>Features</span>
                  <ChevronRight size={16} className="mobile-link-arrow" />
                </a>

                <a
                  href="/#how-it-works"
                  className="mobile-nav-link"
                  onClick={handleSectionClick("how-it-works")}
                >
                  <span>How It Works</span>
                  <ChevronRight size={16} className="mobile-link-arrow" />
                </a>

                <a
                  href="/#contact"
                  className="mobile-nav-link"
                  onClick={handleSectionClick("contact")}
                >
                  <span>Contact</span>
                  <ChevronRight size={16} className="mobile-link-arrow" />
                </a>
              </div>

              <div className="mobile-login-container">
                <Link
                  to="/login"
                  className="navbar-mobile-login"
                  onClick={closeMenu}
                >
                  <span>Access Your Portal</span>
                  <ArrowRight size={17} strokeWidth={2.4} />
                </Link>
                <p className="mobile-login-note">
                  Authorized access for firm clients, staff &amp; partners
                </p>
              </div>
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}

export default Navbar;
