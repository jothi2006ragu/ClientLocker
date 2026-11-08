import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  FolderLock,
  ShieldCheck,
  MapPin,
  ArrowUpRight,
  Lock,
  FileText,
  Mail,
  CheckCircle2
} from "lucide-react";
import "./Footer.css";

const currentYear = new Date().getFullYear();

function Footer() {
  const location = useLocation();
  const navigate = useNavigate();

  const handleSectionClick = (sectionId) => (e) => {
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
    <footer className="main-footer" id="contact">
      <div className="footer-top-accent" />
      <div className="footer-container">
        {/* Brand Information */}
        <div className="footer-brand-section">
          <Link to="/" className="footer-brand" aria-label="ClientLocker Home">
            <span className="footer-brand-icon">
              <FolderLock size={22} strokeWidth={2.4} />
            </span>
            <span className="footer-brand-name">
              Client<span className="footer-brand-accent">Locker</span>
            </span>
          </Link>

          <p className="footer-description">
            A secure, role-governed document management portal engineered exclusively for{" "}
            <strong>Vaigai Vel &amp; Associates</strong>. Safeguarding confidential financial, tax, and statutory records.
          </p>

          <div className="footer-security-badge">
            <ShieldCheck size={16} className="security-badge-icon" />
            <span>256-Bit Encrypted • Role-Governed Access</span>
          </div>

          <div className="footer-firm-pill">
            <span className="pill-dot" />
            <span>Client Portal Active • Madurai, India</span>
          </div>
        </div>

        {/* Quick Links */}
        <div className="footer-links-section">
          <h3 className="footer-heading">Quick Links</h3>
          <ul className="footer-links-list">
            <li>
              <Link to="/">
                <span>Home</span>
                <ArrowUpRight size={13} className="link-arrow" />
              </Link>
            </li>
            <li>
              <Link to="/about">
                <span>About Us</span>
                <ArrowUpRight size={13} className="link-arrow" />
              </Link>
            </li>
            <li>
              <a href="/#features" onClick={handleSectionClick("features")}>
                <span>Features</span>
                <ArrowUpRight size={13} className="link-arrow" />
              </a>
            </li>
            <li>
              <a href="/#how-it-works" onClick={handleSectionClick("how-it-works")}>
                <span>How It Works</span>
                <ArrowUpRight size={13} className="link-arrow" />
              </a>
            </li>
            <li>
              <Link to="/login">
                <span>Sign In</span>
                <ArrowUpRight size={13} className="link-arrow" />
              </Link>
            </li>
          </ul>
        </div>

        {/* Document Categories */}
        <div className="footer-links-section">
          <h3 className="footer-heading">Document Vault</h3>
          <ul className="footer-categories-list">
            <li>
              <FileText size={14} className="cat-icon" />
              <span>Financial Statements &amp; P&amp;L</span>
            </li>
            <li>
              <CheckCircle2 size={14} className="cat-icon" />
              <span>Income Tax &amp; GST Returns</span>
            </li>
            <li>
              <Lock size={14} className="cat-icon" />
              <span>Statutory Audit Records</span>
            </li>
            <li>
              <ShieldCheck size={14} className="cat-icon" />
              <span>Corporate &amp; MCA Filings</span>
            </li>
          </ul>
        </div>

        {/* Firm Information */}
        <div className="footer-contact-section">
          <h3 className="footer-heading">Firm Information</h3>

          <div className="footer-contact-card">
            <div className="footer-contact-item">
              <MapPin size={18} className="contact-icon" />
              <div>
                <strong>Vaigai Vel &amp; Associates</strong>
                <span>Madurai, Tamil Nadu, India</span>
              </div>
            </div>

            <div className="footer-contact-item">
              <Mail size={18} className="contact-icon" />
              <div>
                <strong>Client Support Portal</strong>
                <span>Authorized Clients &amp; Staff</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="footer-bottom">
        <div className="footer-bottom-container">
          <p className="footer-copyright">
            &copy; {currentYear} ClientLocker. All rights reserved. Developed for Vaigai Vel &amp; Associates.
          </p>

          <div className="footer-bottom-notes">
            <span className="footer-privacy-text">Private &amp; Confidential Document Portal</span>
            <span className="footer-bullet">&bull;</span>
            <span className="footer-privacy-text">Authorized Personnel Only</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
