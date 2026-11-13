
import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  ShieldCheck,
  FolderLock,
  FileText,
  Users,
  ArrowRight,
  Clock,
  Sparkles,
  Menu,
  X,
  CheckCircle2,
  Lock,
  FileCheck,
  Download
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import "./Home.css";

// ============================================================
// EMIL KOWALSKI ANIMATION CURVES & VARIANTS
// ============================================================

const easeOutQuart = [0.23, 1, 0.32, 1];

const fadeUp = {
  hidden: {
    opacity: 0,
    y: 40,
    filter: "blur(6px)"
  },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      duration: 0.65,
      ease: easeOutQuart
    }
  }
};

const fadeLeft = {
  hidden: {
    opacity: 0,
    x: -50
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.7,
      ease: easeOutQuart
    }
  }
};

const fadeRight = {
  hidden: {
    opacity: 0,
    x: 50
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.7,
      ease: easeOutQuart
    }
  }
};

const staggerContainer = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.05
    }
  }
};

const cardContainer = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.09
    }
  }
};

// ============================================================
// HOME COMPONENT
// ============================================================

function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const location = useLocation();

  // Navbar scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 25);
    };

    window.addEventListener("scroll", handleScroll, {
      passive: true
    });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const closeMenu = () => setMobileMenuOpen(false);

  return (
    <main className="home-page">

      {/* =====================================================
          1. NAVBAR
      ===================================================== */}

      <header
        className={`main-navbar ${
          scrolled ? "scrolled-nav" : ""
        }`}
      >
        <div className="navbar-container">

          {/* Brand */}
          <Link
            to="/"
            className="navbar-brand"
            onClick={closeMenu}
            aria-label="ClientLocker Home"
          >
            <span className="navbar-brand-icon">
              <FolderLock size={23} strokeWidth={2.2} />
            </span>

            <span className="navbar-brand-text">
              Client<span>Locker</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav
            className="navbar-desktop-links"
            aria-label="Main navigation"
          >
            <Link
              to="/"
              className={
                location.pathname === "/" ? "active" : ""
              }
            >
              Home
            </Link>

            <Link
              to="/about"
              className={
                location.pathname === "/about" ? "active" : ""
              }
            >
              About
            </Link>

            <a href="#features">
              Features
            </a>

            <a href="#contact">
              Contact
            </a>
          </nav>

          {/* Navbar Actions */}
          <div className="navbar-actions-group">

            <Link
              to="/client/login"
              className="navbar-magic-btn"
              title="Passwordless Magic Link"
            >
              <Sparkles size={14} />
              <span>Magic Link</span>
            </Link>

            <Link
              to="/login"
              className="navbar-login-btn"
            >
              <span>Sign In</span>
              <ArrowRight size={16} />
            </Link>

          </div>

          {/* Mobile Menu Toggle */}
          <button
            type="button"
            className="navbar-menu-toggle"
            onClick={() =>
              setMobileMenuOpen(!mobileMenuOpen)
            }
            aria-label={
              mobileMenuOpen ? "Close menu" : "Open menu"
            }
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? (
              <X size={22} />
            ) : (
              <Menu size={22} />
            )}
          </button>

        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <>
              <motion.div
                className="navbar-backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={closeMenu}
              />

              <motion.nav
                className="navbar-mobile-menu"
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{
                  duration: 0.2,
                  ease: easeOutQuart
                }}
              >
                <Link
                  to="/"
                  onClick={closeMenu}
                  className="active"
                >
                  Home
                </Link>

                <Link
                  to="/about"
                  onClick={closeMenu}
                >
                  About
                </Link>

                <a
                  href="#features"
                  onClick={closeMenu}
                >
                  Features
                </a>

                <a
                  href="#contact"
                  onClick={closeMenu}
                >
                  Contact
                </a>

                <Link
                  to="/client/login"
                  onClick={closeMenu}
                  className="navbar-mobile-magic"
                >
                  <Sparkles size={15} />
                  <span>Client Magic Link</span>
                </Link>

                <Link
                  to="/login"
                  onClick={closeMenu}
                  className="navbar-mobile-login"
                >
                  <span>Sign In</span>
                  <ArrowRight size={16} />
                </Link>

              </motion.nav>
            </>
          )}
        </AnimatePresence>

      </header>


      {/* =====================================================
          2. HERO SECTION
      ===================================================== */}

      <motion.section
        className="home-hero"
        id="home"
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
      >

        {/* Left Column */}
        <motion.div
          className="hero-content"
          variants={fadeLeft}
        >

          <motion.div
            className="hero-badge"
            variants={fadeUp}
          >
            <ShieldCheck size={16} />
            SECURE CLIENT DOCUMENT PORTAL
          </motion.div>

          <motion.h1 variants={fadeUp}>
            Your Documents.
            <span> Our Priority.</span>
          </motion.h1>

          <motion.p variants={fadeUp}>
            Manage, organize and access your important
            business documents through one secure and
            reliable client portal from Vaigai Vel &
            Associates.
          </motion.p>

          <motion.div
            className="hero-buttons"
            variants={fadeUp}
          >
            <Link
              to="/login"
              className="home-primary-btn"
            >
              <span>Access Your Portal</span>
              <ArrowRight size={17} />
            </Link>

            <a
              href="#about"
              className="home-secondary-btn"
            >
              Discover More
            </a>
          </motion.div>

          <motion.div
            className="hero-trust"
            variants={fadeUp}
          >
            <Lock size={16} />

            <span>
              Private access. Protected documents.
              Trusted management.
            </span>
          </motion.div>

        </motion.div>


        {/* Right Column: Document Illustration */}
        <motion.div
          className="hero-illustration"
          variants={fadeRight}
        >

          {/* Ambient Animation */}
          <motion.div
            className="hero-circle"
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.35, 0.65, 0.35]
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />

          {/* Document Card */}
          <motion.div
            className="hero-document-card"
            initial={{
              opacity: 0,
              y: 70,
              rotate: 3
            }}
            animate={{
              opacity: 1,
              y: 0,
              rotate: 0
            }}
            transition={{
              duration: 0.9,
              delay: 0.2,
              ease: easeOutQuart
            }}
            whileHover={{
              y: -4,
              transition: {
                duration: 0.25
              }
            }}
          >

            <div className="hero-card-header">

              <div className="hero-card-icon">
                <FolderLock size={26} />
              </div>

              <span className="secure-status">
                <span />
                SECURE PORTAL
              </span>

            </div>

            <h3>Document Management</h3>

            <p className="hero-card-description">
              Your business files, organized and protected.
            </p>

            {[
              {
                title: "Financial Documents",
                subtitle: "PDF documents"
              },
              {
                title: "Tax Documents",
                subtitle: "Private files"
              },
              {
                title: "Business Records",
                subtitle: "Securely managed"
              }
            ].map((file, idx) => (

              <motion.div
                className="hero-file-row"
                key={file.title}
                initial={{
                  opacity: 0,
                  x: 25
                }}
                animate={{
                  opacity: 1,
                  x: 0
                }}
                transition={{
                  duration: 0.45,
                  delay: 0.45 + idx * 0.12,
                  ease: easeOutQuart
                }}
              >

                <div className="hero-file-icon">
                  <FileText size={18} />
                </div>

                <div>
                  <strong>{file.title}</strong>
                  <small>{file.subtitle}</small>
                </div>

                <CheckCircle2 className="file-check" />

              </motion.div>

            ))}

            <div className="hero-card-footer">
              <ShieldCheck size={18} />
              <span>Protected document access</span>
            </div>

          </motion.div>


          {/* Floating Lock Animation */}
          <motion.div
            className="hero-floating-lock"
            animate={{
              y: [0, -12, 0],
              rotate: [0, 6, 0]
            }}
            transition={{
              duration: 3.5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <Lock size={24} />
          </motion.div>

        </motion.div>

      </motion.section>


      {/* =====================================================
          3. ABOUT SECTION
      ===================================================== */}

      <motion.section
        className="home-about"
        id="about"
        initial="hidden"
        whileInView="visible"
        viewport={{
          once: true,
          amount: 0.25
        }}
        variants={staggerContainer}
      >

        <motion.span
          className="home-section-label"
          variants={fadeUp}
        >
          ABOUT CLIENTLOCKER
        </motion.span>

        <motion.h2 variants={fadeUp}>
          A better way to manage client documents.
        </motion.h2>

        <motion.p variants={fadeUp}>
          ClientLocker is a private document management
          portal designed for Vaigai Vel & Associates.
          It helps manage client files, control access
          and organize important business records.
        </motion.p>

      </motion.section>


      {/* =====================================================
          4. FEATURES SECTION
      ===================================================== */}

      <motion.section
        className="home-features"
        id="features"
        initial="hidden"
        whileInView="visible"
        viewport={{
          once: true,
          amount: 0.15
        }}
        variants={staggerContainer}
      >

        <motion.span
          className="home-section-label"
          variants={fadeUp}
        >
          OUR FEATURES
        </motion.span>

        <motion.h2 variants={fadeUp}>
          Everything organized. Everything protected.
        </motion.h2>

        <motion.p
          className="features-intro"
          variants={fadeUp}
        >
          A centralized portal designed for secure
          and organized client document management.
        </motion.p>


        <motion.div
          className="home-feature-grid"
          variants={cardContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{
            once: true,
            amount: 0.1
          }}
        >

          {[
            {
              icon: ShieldCheck,
              title: "Secure Access",
              description:
                "Role-based permissions help users access only the documents they are authorized to view."
            },
            {
              icon: FolderLock,
              title: "Private File Storage",
              description:
                "Manage important client documents through private, controlled file access."
            },
            {
              icon: Users,
              title: "Access Management",
              description:
                "Manage staff and client access according to assigned permissions."
            },
            {
              icon: FileCheck,
              title: "Document Checklist",
              description:
                "Organize required documents and track checklist completion for each client."
            },
            {
              icon: Clock,
              title: "Activity Tracking",
              description:
                "Maintain a record of important document activities and access events."
            },
            {
              icon: Download,
              title: "Controlled Downloads",
              description:
                "Access documents through temporary, authorized download links."
            }
          ].map((feature) => {

            const Icon = feature.icon;

            return (
              <motion.article
                className="home-feature-card"
                key={feature.title}
                variants={fadeUp}
                whileHover={{
                  y: -8,
                  transition: {
                    duration: 0.22,
                    ease: easeOutQuart
                  }
                }}
              >

                <div className="home-feature-icon">
                  <Icon size={24} />
                </div>

                <h3>{feature.title}</h3>

                <p>{feature.description}</p>

              </motion.article>
            );

          })}

        </motion.div>

      </motion.section>


      {/* =====================================================
          5. CALL TO ACTION
      ===================================================== */}

      <motion.section
        className="home-cta"
        initial="hidden"
        whileInView="visible"
        viewport={{
          once: true,
          amount: 0.25
        }}
        variants={staggerContainer}
      >

        <motion.div variants={fadeLeft}>

          <span className="home-section-label">
            CLIENT PORTAL
          </span>

          <h2>
            Your documents are just a sign-in away.
          </h2>

          <p>
            Access your authorized documents through
            the ClientLocker portal.
          </p>

        </motion.div>


        <motion.div variants={fadeRight}>

          <Link
            to="/login"
            className="home-cta-btn"
          >
            <span>Sign In Now</span>
            <ArrowRight size={18} />
          </Link>

        </motion.div>

      </motion.section>


      {/* =====================================================
          6. FOOTER
      ===================================================== */}

      <footer
        className="main-footer"
        id="contact"
      >

        <div className="footer-container">

          {/* Brand */}
          <div className="footer-brand-section">

            <Link
              to="/"
              className="footer-brand"
              aria-label="ClientLocker Home"
            >

              <span className="footer-brand-icon">
                <FolderLock
                  size={23}
                  strokeWidth={2.2}
                />
              </span>

              <span className="footer-brand-name">
                Client<span>Locker</span>
              </span>

            </Link>

            <p className="footer-description">
              A private client document management
              portal designed for Vaigai Vel &
              Associates.
            </p>

            <div className="footer-security">
              <ShieldCheck size={18} />

              <span>
                Secure client document management
              </span>
            </div>

          </div>


          {/* Quick Links */}
          <div className="footer-links-section">

            <h3>Quick Links</h3>

            <Link to="/">
              Home <ArrowRight size={13} />
            </Link>

            <Link to="/about">
              About Us <ArrowRight size={13} />
            </Link>

            <a href="#features">
              Features <ArrowRight size={13} />
            </a>

            <Link to="/login">
              Client Portal <ArrowRight size={13} />
            </Link>

            <Link to="/client/login">
              Magic Link Login <ArrowRight size={13} />
            </Link>

          </div>


          {/* Firm Information */}
          <div className="footer-contact-section">

            <h3>Firm Information</h3>

            <div className="footer-contact-item">

              <ShieldCheck size={18} />

              <div>
                <strong>Location</strong>
                <span>Madurai, Tamil Nadu, India</span>
              </div>

            </div>

            <div className="footer-contact-item">

              <FolderLock size={18} />

              <div>
                <strong>Organization</strong>
                <span>Vaigai Vel & Associates</span>
              </div>

            </div>

          </div>

        </div>


        {/* Footer Bottom */}
        <div className="footer-bottom">

          <p>
            © {new Date().getFullYear()} ClientLocker.
            All rights reserved.
          </p>

          <p>
            A secure document management portal.
          </p>

        </div>

      </footer>

    </main>
  );
}

export default Home;
