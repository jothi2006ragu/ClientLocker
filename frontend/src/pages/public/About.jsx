import {
  ShieldCheck,
  FolderLock,
  Users,
  FileCheck,
  LockKeyhole,
  ClipboardCheck,
  ArrowRight,
  Building2,
  Eye,
  History,
  MapPin
} from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import "./About.css";

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

function About() {
  const purposes = [
    {
      icon: FolderLock,
      title: "Centralized Documents",
      description:
        "Keep client documents organized, indexed, and accessible through one centralized, secure repository."
    },
    {
      icon: ShieldCheck,
      title: "Controlled Permissions",
      description:
        "Give partners, staff, business clients, and statutory auditors access according strictly to assigned roles."
    },
    {
      icon: ClipboardCheck,
      title: "Document Checklist",
      description:
        "Organize required client compliance files and track which checklist submissions have been verified."
    },
    {
      icon: History,
      title: "Activity Records",
      description:
        "Maintain immutable records of uploads, downloads, file openings, blocked attempts, and permission changes."
    }
  ];

  const roles = [
    {
      title: "Partner",
      tag: "Full Governance",
      tagClass: "tag-partner",
      icon: Building2,
      description:
        "View all firm clients and files, oversee staff permissions, assign auditors, and review full activity logs."
    },
    {
      title: "Staff",
      tag: "Operational",
      tagClass: "tag-staff",
      icon: Users,
      description:
        "Access, upload, organize, and open files strictly for their assigned accounting clients."
    },
    {
      title: "Client",
      tag: "Direct Access",
      tagClass: "tag-client",
      icon: FolderLock,
      description:
        "View, verify, and securely download tax returns and financial statements belonging to their own business."
    },
    {
      title: "Auditor",
      tag: "Read-Only Inspection",
      tagClass: "tag-auditor",
      icon: Eye,
      description:
        "Inspect and review statutory documentation for assigned clients without upload, edit, or delete permissions."
    }
  ];

  return (
    <div className="about-page">
      {/* ====================================================================
          1. ABOUT HERO
          ==================================================================== */}
      <section className="about-hero">
        <div className="about-hero-bg-decorations" aria-hidden="true">
          <div className="about-orb about-orb-1" />
          <div className="about-orb about-orb-2" />
        </div>

        <div className="about-hero-container">
          <motion.div
            className="about-hero-content"
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
          >
            <motion.div className="about-eyebrow-badge" variants={fadeUp}>
              <Building2 size={15} />
              <span>ABOUT VAIGAI VEL &amp; ASSOCIATES</span>
            </motion.div>

            <motion.h1 className="about-hero-title" variants={fadeUp}>
              Bringing Trust and
              <span className="about-title-highlight"> Security to Client Documents.</span>
            </motion.h1>

            <motion.p className="about-hero-description" variants={fadeUp}>
              ClientLocker is a private document management portal developed for{" "}
              <strong>Vaigai Vel &amp; Associates</strong>, an accounting firm based in
              Madurai, Tamil Nadu. It centralizes client records, controls sensitive access,
              and establishes an institutional-grade document bridge.
            </motion.p>

            <motion.div className="about-hero-actions" variants={fadeUp}>
              <Link to="/login" className="btn-about-primary">
                <span>Access Client Portal</span>
                <ArrowRight size={17} strokeWidth={2.4} />
              </Link>
            </motion.div>
          </motion.div>

          <motion.div
            className="about-hero-visual-wrapper"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="about-visual-card">
              <div className="about-card-badge">
                <FolderLock size={20} />
                <span>CONFIDENTIAL CLIENT PORTAL</span>
              </div>

              <h3 className="about-card-title">Documents in One Secure Place</h3>
              <p className="about-card-desc">
                Engineered for Vaigai Vel &amp; Associates to replace fragmented email exchanges
                with end-to-end security.
              </p>

              <div className="about-card-points">
                <div className="card-point">
                  <ShieldCheck size={18} className="point-icon" />
                  <span>Server-enforced role access controls</span>
                </div>
                <div className="card-point">
                  <Users size={18} className="point-icon" />
                  <span>Granular 4-tier permission hierarchy</span>
                </div>
                <div className="card-point">
                  <FileCheck size={18} className="point-icon" />
                  <span>Audited financial and tax document vaults</span>
                </div>
              </div>

              <div className="about-card-footer">
                <div className="card-footer-item">
                  <LockKeyhole size={15} />
                  <span>256-Bit AES Encryption</span>
                </div>
                <span className="card-footer-tag">Active Protection</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ====================================================================
          2. ORGANIZATION OVERVIEW
          ==================================================================== */}
      <section className="about-org-section">
        <div className="section-container">
          <div className="about-org-grid">
            <motion.div
              className="about-org-content"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              variants={staggerContainer}
            >
              <motion.span className="section-eyebrow" variants={fadeUp}>
                OUR FIRM
              </motion.span>

              <motion.h2 className="section-heading" variants={fadeUp}>
                Vaigai Vel &amp; Associates
              </motion.h2>

              <motion.p className="about-org-text" variants={fadeUp}>
                Vaigai Vel &amp; Associates is the accounting firm for which ClientLocker
                is purpose-built. The portal provides a centralized, modern approach to
                managing business client documents.
              </motion.p>

              <motion.p className="about-org-text" variants={fadeUp}>
                The organization manages its client relationships, assigns staff access,
                maintains financial and tax documentation, and monitors vital audit activities
                through strictly governed access.
              </motion.p>

              <motion.div className="about-location-pill" variants={fadeUp}>
                <MapPin size={17} className="location-icon" />
                <span>Madurai, Tamil Nadu, India</span>
              </motion.div>
            </motion.div>

            <motion.div
              className="about-org-card-box"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.7 }}
            >
              <div className="org-card-inner">
                <div className="org-card-icon-box">
                  <Building2 size={32} strokeWidth={2.2} />
                </div>
                <span className="org-card-pill">ACCOUNTING FIRM PORTAL</span>
                <h3 className="org-card-title">Organized Client Document Management</h3>
                <p className="org-card-desc">
                  A centralized digital workspace designed exclusively for authorized firm
                  members, staff, clients, and statutory auditors.
                </p>

                <div className="org-card-stats">
                  <div className="org-stat-item">
                    <span className="org-stat-num">Private</span>
                    <span className="org-stat-label">Document Repository</span>
                  </div>
                  <div className="org-stat-divider" />
                  <div className="org-stat-item">
                    <span className="org-stat-num">4-Tier</span>
                    <span className="org-stat-label">Role Isolation</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          3. PURPOSE & VALUE
          ==================================================================== */}
      <section className="about-purpose-section">
        <div className="section-container">
          <div className="section-header text-center">
            <span className="section-eyebrow">WHY CLIENTLOCKER</span>
            <h2 className="section-heading">
              One Portal. Better Document Management.
            </h2>
            <p className="section-description">
              Designed to make client document handling more organized, controlled, and transparent.
            </p>
          </div>

          <div className="about-purpose-grid">
            {purposes.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="about-purpose-card">
                  <div className="purpose-card-icon">
                    <Icon size={24} strokeWidth={2.2} />
                  </div>
                  <h3 className="purpose-card-title">{item.title}</h3>
                  <p className="purpose-card-text">{item.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ====================================================================
          4. ACCESS ROLES MATRIX
          ==================================================================== */}
      <section className="about-roles-section">
        <div className="section-container">
          <div className="section-header text-center">
            <span className="section-eyebrow">ACCESS MANAGEMENT</span>
            <h2 className="section-heading">
              Designed Around Different Responsibilities
            </h2>
            <p className="section-description">
              ClientLocker supports four distinct user roles, ensuring each person interacts
              with files within their strict authorization boundary.
            </p>
          </div>

          <div className="about-roles-grid">
            {roles.map((role) => {
              const Icon = role.icon;
              return (
                <div key={role.title} className="about-role-card">
                  <div className="role-card-top">
                    <div className="role-icon-box">
                      <Icon size={22} strokeWidth={2.2} />
                    </div>
                    <span className={`role-badge ${role.tagClass}`}>{role.tag}</span>
                  </div>
                  <h3 className="role-name">{role.title}</h3>
                  <p className="role-desc">{role.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ====================================================================
          5. SECURITY & PRIVACY
          ==================================================================== */}
      <section className="about-security-section">
        <div className="section-container">
          <div className="about-security-grid">
            <div className="about-security-visual-block">
              <div className="security-visual-emblem">
                <ShieldCheck size={72} strokeWidth={2} />
              </div>
              <div className="security-pulse-ring ring-1" />
              <div className="security-pulse-ring ring-2" />
            </div>

            <div className="about-security-content">
              <span className="section-eyebrow">SECURITY AND PRIVACY</span>
              <h2 className="section-heading">
                Access Should Always Be Controlled.
              </h2>
              <p className="about-security-intro">
                ClientLocker is designed from the ground up to safeguard sensitive client
                accounting records by enforcing strict authorization checks on the server.
              </p>

              <ul className="security-features-checklist">
                <li>
                  <div className="checklist-icon-box">
                    <ShieldCheck size={17} />
                  </div>
                  <div>
                    <strong>Role-Based Authorization</strong>
                    <span>Permissions verified on every single API route and file request.</span>
                  </div>
                </li>

                <li>
                  <div className="checklist-icon-box">
                    <LockKeyhole size={17} />
                  </div>
                  <div>
                    <strong>Private Document Storage</strong>
                    <span>Files reside in secure vaults with no public or indexed web access.</span>
                  </div>
                </li>

                <li>
                  <div className="checklist-icon-box">
                    <Eye size={17} />
                  </div>
                  <div>
                    <strong>Permission Checks on Open</strong>
                    <span>Authorized time-limited tokens generated only for verified sessions.</span>
                  </div>
                </li>

                <li>
                  <div className="checklist-icon-box">
                    <History size={17} />
                  </div>
                  <div>
                    <strong>Activity &amp; Blocked-Access Records</strong>
                    <span>Real-time logging of access attempts to prevent unauthorized leaks.</span>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          6. CTA SECTION
          ==================================================================== */}
      <section className="about-cta-section">
        <div className="section-container">
          <div className="about-cta-card">
            <div className="about-cta-inner">
              <span className="about-cta-badge">CLIENTLOCKER PORTAL</span>
              <h2 className="about-cta-heading">Manage Client Documents with Confidence</h2>
              <p className="about-cta-desc">
                Access the portal using your authorized account from Vaigai Vel &amp; Associates.
              </p>

              <Link to="/login" className="btn-about-cta">
                <span>Sign In to Portal</span>
                <ArrowRight size={17} strokeWidth={2.4} />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default About;
