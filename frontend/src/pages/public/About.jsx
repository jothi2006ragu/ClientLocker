
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
  History
} from "lucide-react";

import { motion } from "framer-motion";
import { Link } from "react-router-dom";

import "./About.css";

const reveal = {
  hidden: {
    opacity: 0,
    y: 45
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.75,
      ease: [0.22, 1, 0.36, 1]
    }
  }
};

const stagger = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.15
    }
  }
};

function About() {
  return (
    <main className="about-page">

      {/* Hero */}
      <section className="about-hero">
        <div className="about-hero-content">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={stagger}
          >
            <motion.span className="about-eyebrow" variants={reveal}>
              <Building2 size={16} />
              ABOUT OUR ORGANIZATION
            </motion.span>

            <motion.h1 variants={reveal}>
              Bringing trust and
              <span> security to client documents.</span>
            </motion.h1>

            <motion.p variants={reveal}>
              ClientLocker is a private document management
              portal developed for Vaigai Vel & Associates
              to organize client records and manage document
              access securely.
            </motion.p>

            <motion.div variants={reveal}>
              <Link to="/login" className="about-primary-btn">
                Access Client Portal
                <ArrowRight size={18} />
              </Link>
            </motion.div>
          </motion.div>
        </div>

        <motion.div
          className="about-hero-visual"
          initial={{ opacity: 0, x: 70 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1 }}
        >
          <div className="about-visual-glow" />

          <div className="about-visual-card">
            <div className="about-visual-icon">
              <FolderLock size={38} />
            </div>

            <span className="about-visual-label">
              CLIENTLOCKER PORTAL
            </span>

            <h3>Documents in one secure place.</h3>

            <div className="about-visual-line">
              <ShieldCheck size={19} />
              <span>Controlled document access</span>
            </div>

            <div className="about-visual-line">
              <Users size={19} />
              <span>Role-based permissions</span>
            </div>

            <div className="about-visual-line">
              <FileCheck size={19} />
              <span>Organized client records</span>
            </div>
          </div>

          <div className="about-floating-icon">
            <LockKeyhole size={25} />
          </div>
        </motion.div>
      </section>

      {/* Organization */}
      <motion.section
        className="about-organization"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={stagger}
      >
        <motion.div className="about-organization-content" variants={reveal}>
          <span className="about-section-label">
            OUR ORGANIZATION
          </span>

          <h2>
            Vaigai Vel & Associates
          </h2>

          <p>
            Vaigai Vel & Associates is the accounting firm
            for which ClientLocker is being developed.
            The portal provides a centralized approach
            to managing business client documents.
          </p>

          <p>
            The organization can manage its clients,
            assign staff access, maintain document records
            and monitor important activities through
            controlled access.
          </p>

          <div className="about-location">
            <Building2 size={19} />
            <span>Madurai, Tamil Nadu, India</span>
          </div>
        </motion.div>

        <motion.div
          className="about-organization-visual"
          variants={reveal}
        >
          <div className="about-building-card">
            <div className="about-building-icon">
              <Building2 size={38} />
            </div>

            <span>ACCOUNTING FIRM PORTAL</span>

            <h3>Organized client document management</h3>

            <p>
              A centralized workspace for authorized
              firm members and clients.
            </p>
          </div>
        </motion.div>
      </motion.section>

      {/* Purpose */}
      <section className="about-purpose">
        <motion.div
          className="about-section-heading"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={reveal}
        >
          <span className="about-section-label">
            WHY CLIENTLOCKER
          </span>

          <h2>One portal. Better document management.</h2>

          <p>
            Designed to make client document handling
            more organized, controlled and transparent.
          </p>
        </motion.div>

        <motion.div
          className="about-purpose-grid"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          variants={stagger}
        >
          {[
            {
              icon: FolderLock,
              title: "Centralized Documents",
              description:
                "Keep client documents organized and accessible through one centralized portal."
            },
            {
              icon: ShieldCheck,
              title: "Controlled Permissions",
              description:
                "Give partners, staff, clients and auditors access according to their assigned roles."
            },
            {
              icon: ClipboardCheck,
              title: "Document Checklist",
              description:
                "Organize required client documents and track which checklist items are completed."
            },
            {
              icon: History,
              title: "Activity Records",
              description:
                "Maintain records of uploads, file access, blocked attempts and permission changes."
            }
          ].map((item) => {
            const Icon = item.icon;

            return (
              <motion.article
                className="about-purpose-card"
                key={item.title}
                variants={reveal}
                whileHover={{ y: -8 }}
              >
                <div className="about-purpose-icon">
                  <Icon size={25} />
                </div>

                <h3>{item.title}</h3>

                <p>{item.description}</p>
              </motion.article>
            );
          })}
        </motion.div>
      </section>

      {/* Access Roles */}
      <section className="about-access">
        <div className="about-access-heading">
          <span className="about-section-label">
            ACCESS MANAGEMENT
          </span>

          <h2>Designed around different responsibilities.</h2>

          <p>
            ClientLocker supports four user roles with
            different document permissions.
          </p>
        </div>

        <div className="about-access-grid">
          <motion.article
            className="about-access-card"
            whileHover={{ y: -6 }}
          >
            <div className="about-access-icon">
              <Building2 />
            </div>
            <h3>Partner</h3>
            <p>
              View all clients and files, manage staff access
              and review activity records.
            </p>
          </motion.article>

          <motion.article
            className="about-access-card"
            whileHover={{ y: -6 }}
          >
            <div className="about-access-icon">
              <Users />
            </div>
            <h3>Staff</h3>
            <p>
              Access, upload and open files only for
              assigned clients.
            </p>
          </motion.article>

          <motion.article
            className="about-access-card"
            whileHover={{ y: -6 }}
          >
            <div className="about-access-icon">
              <FolderLock />
            </div>
            <h3>Client</h3>
            <p>
              View and open documents belonging to
              their own business.
            </p>
          </motion.article>

          <motion.article
            className="about-access-card"
            whileHover={{ y: -6 }}
          >
            <div className="about-access-icon">
              <Eye />
            </div>
            <h3>Auditor</h3>
            <p>
              View and open files for exactly two
              assigned clients without uploading or deleting.
            </p>
          </motion.article>
        </div>
      </section>

      {/* Security */}
      <motion.section
        className="about-security"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={stagger}
      >
        <motion.div className="about-security-visual" variants={reveal}>
          <div className="about-security-icon">
            <ShieldCheck size={65} />
          </div>

          <div className="about-security-decoration decoration-one" />
          <div className="about-security-decoration decoration-two" />
        </motion.div>

        <motion.div className="about-security-content" variants={reveal}>
          <span className="about-section-label">
            SECURITY AND PRIVACY
          </span>

          <h2>
            Access should always be controlled.
          </h2>

          <p>
            ClientLocker is designed to protect client
            documents by enforcing access permissions
            on the server.
          </p>

          <ul>
            <li>
              <ShieldCheck size={19} />
              Role-based authorization
            </li>

            <li>
              <LockKeyhole size={19} />
              Private document storage
            </li>

            <li>
              <Eye size={19} />
              Permission checks when opening files
            </li>

            <li>
              <History size={19} />
              Activity and blocked-access records
            </li>
          </ul>
        </motion.div>
      </motion.section>

      {/* CTA */}
      <section className="about-cta">
        <div>
          <span className="about-section-label">
            CLIENTLOCKER PORTAL
          </span>

          <h2>Manage client documents with confidence.</h2>

          <p>
            Access the portal using your authorized account.
          </p>
        </div>

        <Link to="/login" className="about-cta-btn">
          Sign In to Portal
          <ArrowRight size={18} />
        </Link>
      </section>

    </main>
  );
}

export default About;
