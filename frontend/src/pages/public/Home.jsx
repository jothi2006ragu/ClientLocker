import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ShieldCheck,
  FolderLock,
  Users,
  ArrowRight,
  LockKeyhole,
  CheckCircle,
  Cloud,
  FileSpreadsheet,
  Receipt,
  Building2,
  CheckCircle2,
  Search,
  KeyRound,
  FolderTree,
  Share2,
  Activity,
  Eye,
  Shield,
  Layers
} from "lucide-react";
import { motion } from "framer-motion";
import "./Home.css";

// Animation variants
const fadeUp = {
  hidden: {
    opacity: 0,
    y: 35
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.7,
      ease: [0.16, 1, 0.3, 1]
    }
  }
};

const staggerContainer = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.12
    }
  }
};

const cardStagger = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

function Home() {
  const [activeTab, setActiveTab] = useState("all");

  const trustCards = [
    {
      icon: ShieldCheck,
      title: "Secure Document Storage",
      description:
        "Keep important documents protected and organized with 256-bit AES encryption at rest and in transit."
    },
    {
      icon: KeyRound,
      title: "Controlled Access",
      description:
        "Ensure users only access the documents they are authorized to view through strict role-based permission controls."
    },
    {
      icon: Layers,
      title: "Organized Management",
      description:
        "Manage financial records, invoices and tax documents in one place with structured folders and quick retrieval."
    }
  ];

  const features = [
    {
      icon: FolderLock,
      title: "Secure File Management",
      description:
        "End-to-end encrypted storage ensuring client records remain confidential, tamper-proof, and accessible only to authorized personnel.",
      badge: "Encrypted Vault"
    },
    {
      icon: Users,
      title: "Role-Based Access",
      description:
        "Granular permission controls designed specifically for accounting partners, staff accountants, business clients, and external auditors.",
      badge: "Access Governance"
    },
    {
      icon: FolderTree,
      title: "Client Document Organization",
      description:
        "Structure documents cleanly by financial years, tax categories, statutory audits, and corporate compliance folders.",
      badge: "Tax Year Indexing"
    },
    {
      icon: Share2,
      title: "Private Document Sharing",
      description:
        "Securely exchange financial statements and confidential reports within the portal without risky email attachments.",
      badge: "Zero-Leak Sharing"
    },
    {
      icon: Activity,
      title: "Activity Tracking",
      description:
        "Comprehensive, tamper-proof audit trails that record every view, upload, download, and permission change in real time.",
      badge: "Audit Trails"
    },
    {
      icon: Eye,
      title: "Auditor Access",
      description:
        "Provide dedicated, scoped, read-only portals for statutory auditors and tax inspectors without exposing unrelated client records.",
      badge: "Read-Only Portals"
    }
  ];

  const workflowSteps = [
    {
      step: "01",
      icon: LockKeyhole,
      title: "Secure Access",
      description:
        "Users sign in with their authorized credentials. Dual-factor verification ensures that only authenticated clients and firm personnel can enter."
    },
    {
      step: "02",
      icon: Cloud,
      title: "Manage Documents",
      description:
        "Upload and organize client documents securely. Categorize tax returns, financial statements, and compliance audits with instant tagging."
    },
    {
      step: "03",
      icon: ShieldCheck,
      title: "Access with Confidence",
      description:
        "View and manage documents according to assigned permissions. Access records knowing every file is encrypted and tracked."
    }
  ];

  return (
    <div className="home-page">
      {/* ====================================================================
          1. HERO SECTION
          ==================================================================== */}
      <section className="home-hero" id="home">
        <div className="hero-background-decorations" aria-hidden="true">
          <div className="hero-gradient-orb hero-orb-left" />
          <div className="hero-gradient-orb hero-orb-right" />
          <div className="hero-grid-pattern" />
        </div>

        <div className="hero-container">
          {/* Left Column: Headline, Description & CTAs */}
          <motion.div
            className="hero-content"
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
          >
            {/* Firm & Security Eyebrow */}
            <motion.div className="hero-badge" variants={fadeUp}>
              <span className="hero-badge-icon">
                <ShieldCheck size={15} strokeWidth={2.4} />
              </span>
              <span className="hero-badge-text">
                VAIGAI VEL &amp; ASSOCIATES &bull; SECURE CLIENT PORTAL
              </span>
            </motion.div>

            {/* Main Headline */}
            <motion.h1 className="hero-title" variants={fadeUp}>
              Your Documents.
              <span className="hero-title-highlight"> Our Priority.</span>
            </motion.h1>

            {/* Supporting Description */}
            <motion.p className="hero-description" variants={fadeUp}>
              Manage, organize and access your important business documents through
              one secure and reliable client portal from{" "}
              <strong>Vaigai Vel &amp; Associates</strong>.
            </motion.p>

            {/* Action Buttons */}
            <motion.div className="hero-buttons-group" variants={fadeUp}>
              <Link to="/login" className="btn-primary-hero">
                <span>Access Your Portal</span>
                <ArrowRight size={18} strokeWidth={2.4} className="btn-arrow" />
              </Link>

              <a href="#about" className="btn-secondary-hero">
                <span>Discover More</span>
              </a>
            </motion.div>

            {/* Security Guarantee Message */}
            <motion.div className="hero-security-message" variants={fadeUp}>
              <div className="security-icon-circle">
                <LockKeyhole size={15} strokeWidth={2.4} />
              </div>
              <span>Private access. Protected documents. Trusted management.</span>
            </motion.div>
          </motion.div>

          {/* Right Column: Modern Document Management Dashboard Illustration */}
          <motion.div
            className="hero-preview-wrapper"
            initial={{ opacity: 0, scale: 0.95, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
          >
            {/* Ambient Background Glow */}
            <div className="hero-preview-glow" aria-hidden="true" />

            {/* Floating Security Badge (Top Right) */}
            <motion.div
              className="floating-security-badge"
              animate={{
                y: [0, -8, 0]
              }}
              transition={{
                duration: 4.5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <div className="floating-badge-icon">
                <ShieldCheck size={18} strokeWidth={2.4} />
              </div>
              <div className="floating-badge-text">
                <strong>256-Bit AES Encryption</strong>
                <span>Bank-grade record safety</span>
              </div>
            </motion.div>

            {/* Floating Role Status Card (Bottom Left) */}
            <motion.div
              className="floating-role-card"
              animate={{
                y: [0, 8, 0]
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.8
              }}
            >
              <div className="floating-role-header">
                <span className="role-pulse-dot" />
                <span className="role-status-text">Authorized Role Access</span>
              </div>
              <p className="role-detail-text">
                Partner &bull; Staff &bull; Client &bull; Auditor
              </p>
            </motion.div>

            {/* SaaS Dashboard Preview Window */}
            <div className="saas-preview-window">
              {/* Window Header */}
              <div className="saas-window-header">
                <div className="saas-window-dots">
                  <span className="dot dot-close" />
                  <span className="dot dot-minimize" />
                  <span className="dot dot-maximize" />
                </div>

                <div className="saas-window-search">
                  <Search size={13} className="search-icon" />
                  <span>Search financial records, tax documents, GST filings...</span>
                </div>

                <div className="saas-secure-indicator">
                  <span className="pulse-indicator" />
                  <span>SECURE PORTAL</span>
                </div>
              </div>

              {/* SaaS Dashboard Body */}
              <div className="saas-dashboard-card">
                {/* Header */}
                <div className="saas-card-header">
                  <div className="saas-card-title-group">
                    <div className="saas-app-icon">
                      <FolderLock size={22} strokeWidth={2.4} />
                    </div>
                    <div>
                      <h3 className="saas-card-heading">Document Management</h3>
                      <p className="saas-card-sub">
                        Vaigai Vel &amp; Associates &bull; Confidential Client Repository
                      </p>
                    </div>
                  </div>

                  <span className="saas-status-pill">
                    <CheckCircle2 size={13} strokeWidth={2.5} />
                    <span>Active Protected Session</span>
                  </span>
                </div>

                {/* Filter Tabs */}
                <div className="saas-filter-tabs">
                  <button
                    type="button"
                    className={`saas-tab ${activeTab === "all" ? "active" : ""}`}
                    onClick={() => setActiveTab("all")}
                  >
                    All Documents
                  </button>
                  <button
                    type="button"
                    className={`saas-tab ${activeTab === "financial" ? "active" : ""}`}
                    onClick={() => setActiveTab("financial")}
                  >
                    Financial
                  </button>
                  <button
                    type="button"
                    className={`saas-tab ${activeTab === "tax" ? "active" : ""}`}
                    onClick={() => setActiveTab("tax")}
                  >
                    Tax Records
                  </button>
                  <button
                    type="button"
                    className={`saas-tab ${activeTab === "records" ? "active" : ""}`}
                    onClick={() => setActiveTab("records")}
                  >
                    Business
                  </button>
                </div>

                {/* Document Rows */}
                <div className="saas-files-list">
                  {/* Row 1: Financial Documents */}
                  <motion.div
                    className="saas-file-row"
                    whileHover={{ x: 4, backgroundColor: "#F8FAFC" }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="saas-file-icon-box file-financial">
                      <FileSpreadsheet size={19} strokeWidth={2.2} />
                    </div>

                    <div className="saas-file-info">
                      <div className="saas-file-title-line">
                        <strong className="saas-file-title">Financial Documents</strong>
                        <span className="saas-file-tag">FY 2025-26</span>
                      </div>
                      <span className="saas-file-sub">
                        Audited Balance Sheet &bull; Profit &amp; Loss Statement &bull; PDF
                      </span>
                    </div>

                    <div className="saas-file-status">
                      <CheckCircle className="green-check-icon" size={17} strokeWidth={2.4} />
                      <span className="green-status-text">Verified</span>
                    </div>
                  </motion.div>

                  {/* Row 2: Tax Documents */}
                  <motion.div
                    className="saas-file-row"
                    whileHover={{ x: 4, backgroundColor: "#F8FAFC" }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="saas-file-icon-box file-tax">
                      <Receipt size={19} strokeWidth={2.2} />
                    </div>

                    <div className="saas-file-info">
                      <div className="saas-file-title-line">
                        <strong className="saas-file-title">Tax Documents</strong>
                        <span className="saas-file-tag">GST &amp; IT</span>
                      </div>
                      <span className="saas-file-sub">
                        Income Tax Returns &bull; Form 16 &bull; GST Filings &bull; 12 Files
                      </span>
                    </div>

                    <div className="saas-file-status">
                      <CheckCircle className="green-check-icon" size={17} strokeWidth={2.4} />
                      <span className="green-status-text">Compliant</span>
                    </div>
                  </motion.div>

                  {/* Row 3: Business Records */}
                  <motion.div
                    className="saas-file-row"
                    whileHover={{ x: 4, backgroundColor: "#F8FAFC" }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="saas-file-icon-box file-business">
                      <Building2 size={19} strokeWidth={2.2} />
                    </div>

                    <div className="saas-file-info">
                      <div className="saas-file-title-line">
                        <strong className="saas-file-title">Business Records</strong>
                        <span className="saas-file-tag">Vault</span>
                      </div>
                      <span className="saas-file-sub">
                        Incorporation Certificates &bull; Board Resolutions &bull; Private
                      </span>
                    </div>

                    <div className="saas-file-status">
                      <CheckCircle className="green-check-icon" size={17} strokeWidth={2.4} />
                      <span className="green-status-text">Protected</span>
                    </div>
                  </motion.div>
                </div>

                {/* SaaS Card Footer */}
                <div className="saas-card-footer">
                  <div className="saas-footer-security">
                    <ShieldCheck size={16} className="security-icon-blue" />
                    <span>Protected document access</span>
                  </div>
                  <div className="saas-footer-badge">
                    <span>256-bit AES Protected</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ====================================================================
          2. PROFESSIONAL TRUST SECTION
          ==================================================================== */}
      <section className="home-trust-section" id="trust">
        <div className="section-container">
          <motion.div
            className="section-header text-center"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeUp}
          >
            <span className="section-eyebrow">ENTERPRISE-GRADE TRUST</span>
            <h2 className="section-heading">
              Your Business Documents Deserve Better Protection
            </h2>
            <p className="section-description">
              Keep confidential documents organized, accessible and protected with a
              secure document management experience.
            </p>
          </motion.div>

          <motion.div
            className="trust-cards-grid"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={cardStagger}
          >
            {trustCards.map((card) => {
              const Icon = card.icon;
              return (
                <motion.div
                  key={card.title}
                  className="trust-card"
                  variants={fadeUp}
                  whileHover={{ y: -6, transition: { duration: 0.25 } }}
                >
                  <div className="trust-card-icon-container">
                    <Icon size={26} strokeWidth={2.2} />
                  </div>
                  <h3 className="trust-card-title">{card.title}</h3>
                  <p className="trust-card-text">{card.description}</p>
                </motion.div>
              );
            })}
          </motion.div>

          {/* Trust Metrics Bar */}
          <motion.div
            className="trust-metrics-strip"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeUp}
          >
            <div className="metric-item">
              <span className="metric-number">256-Bit</span>
              <span className="metric-label">AES Encryption Standard</span>
            </div>
            <div className="metric-divider" />
            <div className="metric-item">
              <span className="metric-number">4-Tier</span>
              <span className="metric-label">Role-Based Governance</span>
            </div>
            <div className="metric-divider" />
            <div className="metric-item">
              <span className="metric-number">100%</span>
              <span className="metric-label">Audit Trail Logging</span>
            </div>
            <div className="metric-divider" />
            <div className="metric-item">
              <span className="metric-number">Private</span>
              <span className="metric-label">Vaigai Vel &amp; Associates Vault</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ====================================================================
          3. FEATURES SECTION
          ==================================================================== */}
      <section className="home-features-section" id="features">
        <div className="section-container">
          <motion.div
            className="section-header text-center"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeUp}
          >
            <span className="section-eyebrow">PORTAL CAPABILITIES</span>
            <h2 className="section-heading">
              Everything Organized. Everything Protected.
            </h2>
            <p className="section-description">
              A specialized suite of document tools tailored for accounting firms,
              client collaboration, and strict compliance standards.
            </p>
          </motion.div>

          <motion.div
            className="features-grid"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.15 }}
            variants={cardStagger}
          >
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <motion.article
                  key={feature.title}
                  className="feature-card"
                  variants={fadeUp}
                  whileHover={{
                    y: -8,
                    borderColor: "#2970FF",
                    boxShadow: "0 16px 32px -4px rgba(21, 94, 239, 0.12)",
                    transition: { duration: 0.22 }
                  }}
                >
                  <div className="feature-card-top">
                    <div className="feature-icon-wrapper">
                      <Icon size={24} strokeWidth={2.2} />
                    </div>
                    <span className="feature-micro-badge">{feature.badge}</span>
                  </div>

                  <h3 className="feature-title">{feature.title}</h3>
                  <p className="feature-description">{feature.description}</p>
                </motion.article>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* ====================================================================
          4. ABOUT SECTION
          ==================================================================== */}
      <section className="home-about-section" id="about">
        <div className="section-container">
          <div className="about-grid-layout">
            {/* Left Content */}
            <motion.div
              className="about-left-content"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              variants={staggerContainer}
            >
              <motion.span className="section-eyebrow" variants={fadeUp}>
                ABOUT CLIENTLOCKER
              </motion.span>

              <motion.h2 className="section-heading" variants={fadeUp}>
                A better way to manage confidential client documents.
              </motion.h2>

              <motion.p className="about-body-text" variants={fadeUp}>
                ClientLocker is a private document management portal designed
                specifically for <strong>Vaigai Vel &amp; Associates</strong>, an
                accounting firm based in Madurai, Tamil Nadu. It provides a structured,
                institution-grade platform where the firm and its business clients can
                safely upload, organize, and access sensitive financial records.
              </motion.p>

              <motion.p className="about-body-text" variants={fadeUp}>
                By replacing fragmented email attachments and public shared drives with
                a centralized, role-governed document vault, ClientLocker ensures that
                client records remain private, audit-ready, and properly compartmentalized.
              </motion.p>

              <motion.div className="about-pillars-list" variants={fadeUp}>
                <div className="pillar-item">
                  <div className="pillar-check">
                    <CheckCircle2 size={16} strokeWidth={2.5} />
                  </div>
                  <div>
                    <strong>Purpose-Built for Accounting</strong>
                    <span>Designed for tax schedules, statutory audits, and balance sheets.</span>
                  </div>
                </div>

                <div className="pillar-item">
                  <div className="pillar-check">
                    <CheckCircle2 size={16} strokeWidth={2.5} />
                  </div>
                  <div>
                    <strong>Controlled Permission Hierarchy</strong>
                    <span>Strict role isolation between partners, staff, clients, and auditors.</span>
                  </div>
                </div>

                <div className="pillar-item">
                  <div className="pillar-check">
                    <CheckCircle2 size={16} strokeWidth={2.5} />
                  </div>
                  <div>
                    <strong>Uncompromising Security</strong>
                    <span>Server-enforced access checks and comprehensive event logs.</span>
                  </div>
                </div>
              </motion.div>

              <motion.div className="about-cta-link-wrapper" variants={fadeUp}>
                <Link to="/about" className="about-details-link">
                  <span>Learn more about Vaigai Vel &amp; Associates</span>
                  <ArrowRight size={17} strokeWidth={2.4} />
                </Link>
              </motion.div>
            </motion.div>

            {/* Right Visual Element */}
            <motion.div
              className="about-right-visual"
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="about-visual-card-wrapper">
                <div className="about-visual-header">
                  <div className="about-firm-badge">
                    <Building2 size={20} className="firm-icon" />
                    <div>
                      <strong>Vaigai Vel &amp; Associates</strong>
                      <span>Chartered &amp; Accounting Practice &bull; Madurai</span>
                    </div>
                  </div>
                </div>

                <div className="about-roles-matrix">
                  <div className="matrix-heading">
                    <Shield size={14} />
                    <span>Four-Tier Access Architecture</span>
                  </div>

                  <div className="role-matrix-item">
                    <span className="role-tag role-partner">Partner</span>
                    <span className="role-matrix-desc">Full visibility, staff delegation &amp; audit inspection</span>
                  </div>

                  <div className="role-matrix-item">
                    <span className="role-tag role-staff">Staff</span>
                    <span className="role-matrix-desc">Upload, organize &amp; manage assigned client files</span>
                  </div>

                  <div className="role-matrix-item">
                    <span className="role-tag role-client">Client</span>
                    <span className="role-matrix-desc">Direct view &amp; secure download of company documents</span>
                  </div>

                  <div className="role-matrix-item">
                    <span className="role-tag role-auditor">Auditor</span>
                    <span className="role-matrix-desc">Restricted, read-only inspection for statutory compliance</span>
                  </div>
                </div>

                <div className="about-visual-footer">
                  <div className="about-footer-stat">
                    <FolderLock size={16} />
                    <span>Centralized Document Vault</span>
                  </div>
                  <div className="about-footer-status">
                    <span className="status-live-dot" />
                    <span>Enforced via Server Roles</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          5. HOW IT WORKS SECTION
          ==================================================================== */}
      <section className="home-workflow-section" id="how-it-works">
        <div className="section-container">
          <motion.div
            className="section-header text-center"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeUp}
          >
            <span className="section-eyebrow">HOW IT WORKS</span>
            <h2 className="section-heading">
              Simple, Secure, and Built for Productivity
            </h2>
            <p className="section-description">
              Three clear steps to manage, protect, and exchange confidential accounting records.
            </p>
          </motion.div>

          <div className="workflow-timeline-wrapper">
            <div className="workflow-timeline-line" aria-hidden="true" />

            <motion.div
              className="workflow-steps-grid"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              variants={cardStagger}
            >
              {workflowSteps.map((item) => {
                const Icon = item.icon;
                return (
                  <motion.div
                    key={item.step}
                    className="workflow-step-card"
                    variants={fadeUp}
                    whileHover={{ y: -6, transition: { duration: 0.25 } }}
                  >
                    <div className="workflow-card-top">
                      <span className="workflow-step-number">{item.step}</span>
                      <div className="workflow-icon-box">
                        <Icon size={22} strokeWidth={2.4} />
                      </div>
                    </div>

                    <h3 className="workflow-title">{item.title}</h3>
                    <p className="workflow-description">{item.description}</p>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          6. CALL-TO-ACTION (CTA) SECTION
          ==================================================================== */}
      <section className="home-cta-section">
        <div className="section-container">
          <motion.div
            className="cta-banner-card"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={staggerContainer}
          >
            {/* Background glowing rings */}
            <div className="cta-glow-circle circle-1" aria-hidden="true" />
            <div className="cta-glow-circle circle-2" aria-hidden="true" />

            <div className="cta-content-wrapper">
              <motion.div className="cta-badge" variants={fadeUp}>
                <ShieldCheck size={15} />
                <span>VAIGAI VEL &amp; ASSOCIATES CLIENT PORTAL</span>
              </motion.div>

              <motion.h2 className="cta-heading" variants={fadeUp}>
                Ready to Manage Your Documents Securely?
              </motion.h2>

              <motion.p className="cta-description" variants={fadeUp}>
                Experience a more organized and reliable way to manage your business documents.
              </motion.p>

              <motion.div className="cta-buttons-row" variants={fadeUp}>
                <Link to="/login" className="btn-cta-primary">
                  <span>Access Your Portal</span>
                  <ArrowRight size={18} strokeWidth={2.4} />
                </Link>

                <Link to="/about" className="btn-cta-secondary">
                  <span>Firm Overview</span>
                </Link>
              </motion.div>

              <motion.div className="cta-security-footnote" variants={fadeUp}>
                <LockKeyhole size={14} />
                <span>Protected by 256-bit AES encryption &bull; Authorized credentials required</span>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

export default Home;
