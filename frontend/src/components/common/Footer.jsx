import { Link } from "react-router-dom";
import {
  ShieldCheck,
  Lock,
  FileKey2,
  MapPin,
  Clock,
  ArrowUp,
  ExternalLink,
  Sparkles,
  CheckCircle2
} from "lucide-react";
import "./Footer.css";

function Footer() {
  const currentYear = new Date().getFullYear();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="cl-footer" id="contact">
      {/* Top subtle glow divider */}
      <div className="cl-footer-divider" aria-hidden="true" />

      <div className="cl-footer-container">
        {/* Top Banner: Security Guarantee */}
        <div className="cl-footer-guarantee">
          <div className="cl-guarantee-content">
            <div className="cl-guarantee-icon">
              <ShieldCheck size={26} />
            </div>
            <div>
              <h4>Private Zero-Leak Accounting Infrastructure</h4>
              <p>
                Every client document is secured in private encrypted storage with strictly expiring 10-minute tokens and role-gated access control.
              </p>
            </div>
          </div>

          <div className="cl-guarantee-badges">
            <span className="editorial-tag editorial-tag-emerald">
              <span className="status-dot emerald" /> 100% PRIVATE URLS
            </span>
            <span className="editorial-tag">
              <span className="status-dot" /> TAMPER-EVIDENT LOGS
            </span>
          </div>
        </div>

        {/* 4 Column Grid */}
        <div className="cl-footer-grid">

          {/* Col 1: Brand & Firm Info */}
          <div className="cl-footer-col cl-footer-brand-col">
            <Link to="/" className="cl-footer-logo" onClick={scrollToTop}>
              <div className="cl-footer-emblem">
                <ShieldCheck size={20} />
              </div>
              <span className="cl-footer-title">
                Client<span className="accent">Locker</span>
              </span>
            </Link>

            <p className="cl-footer-bio">
              Proprietary document vault engineered specifically for <strong>Vaigai Vel & Associates</strong>, Chartered Accountants, Madurai.
            </p>

            <div className="cl-firm-address">
              <MapPin size={15} className="cl-addr-icon" />
              <span>Vaigai Complex, KK Nagar, Madurai, Tamil Nadu — 625020</span>
            </div>

            <div className="cl-firm-address">
              <Clock size={15} className="cl-addr-icon" />
              <span>Locker Access: Mon–Sat, 09:00 – 19:00 IST</span>
            </div>
          </div>

          {/* Col 2: Role Access */}
          <div className="cl-footer-col">
            <h5 className="cl-footer-heading">Access Portals</h5>
            <ul className="cl-footer-links">
              <li>
                <Link to="/login">Partner Command Center</Link>
              </li>
              <li>
                <Link to="/login">Staff Client Management</Link>
              </li>
              <li>
                <Link to="/client/login">
                  Client Magic Link
                  <span className="cl-pill-new">PW-Free</span>
                </Link>
              </li>
              <li>
                <Link to="/login">Independent Auditor Desk</Link>
              </li>
              <li>
                <Link to="/login">Development Test Swapper</Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Architecture & Security */}
          <div className="cl-footer-col">
            <h5 className="cl-footer-heading">Security Pillars</h5>
            <ul className="cl-footer-links">
              <li>
                <a href="/#security">Server-Enforced Isolation</a>
              </li>
              <li>
                <a href="/#security">10-Minute Expiring Tokens</a>
              </li>
              <li>
                <a href="/#security">Instant Revocation Check</a>
              </li>
              <li>
                <a href="/#security">Immutable Audit Trail</a>
              </li>
              <li>
                <a href="/#features">AI Checklist Classification</a>
              </li>
            </ul>
          </div>

          {/* Col 4: Platform & Compliance */}
          <div className="cl-footer-col">
            <h5 className="cl-footer-heading">Compliance</h5>
            <ul className="cl-footer-links">
              <li>
                <Link to="/about">About Vaigai Vel Firm</Link>
              </li>
              <li>
                <a href="/#features">Document Verification</a>
              </li>
              <li>
                <span className="cl-compliance-item">
                  <CheckCircle2 size={13} className="text-emerald" /> ICAI Confidentiality Standards
                </span>
              </li>
              <li>
                <span className="cl-compliance-item">
                  <CheckCircle2 size={13} className="text-emerald" /> Cloudflare TLS 1.3 Transport
                </span>
              </li>
              <li>
                <span className="cl-compliance-item">
                  <CheckCircle2 size={13} className="text-emerald" /> Encrypted At-Rest Storage
                </span>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="cl-footer-bottom">
          <div className="cl-footer-legal">
            <span>© {currentYear} ClientLocker for Vaigai Vel & Associates. All rights reserved.</span>
            <span className="cl-divider-dot">•</span>
            <span>Confidential Financial Document Management</span>
          </div>

          <button
            type="button"
            className="cl-scroll-top-btn"
            onClick={scrollToTop}
            aria-label="Back to top"
          >
            <span>Back to top</span>
            <ArrowUp size={15} />
          </button>
        </div>

      </div>
    </footer>
  );
}

export default Footer;
