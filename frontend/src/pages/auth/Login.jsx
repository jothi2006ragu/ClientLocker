
import { useState } from "react";
import { Navigate, Link, useNavigate } from "react-router-dom";
import {
  ShieldCheck,
  Mail,
  LockKeyhole,
  Eye,
  EyeOff,
  ArrowRight,
  FileLock2,
  FlaskConical
} from "lucide-react";
import { GoogleLogin } from "@react-oauth/google";

import { useAuth } from "../../context/AuthContext";
import "./Login.css";

function Login() {
  const navigate = useNavigate();

  const {
    login,
    loginWithGoogle,
    loginWithDemo,
    user,
    loading: authLoading
  } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [googleSubmitting, setGoogleSubmitting] = useState(false);
  const [demoSubmitting, setDemoSubmitting] = useState(false);

  const roleRoutes = {
    partner: "/partner/dashboard",
    staff: "/staff/dashboard",
    client: "/client/dashboard",
    auditor: "/auditor/dashboard"
  };

  const redirectUser = (loggedInUser) => {
    const destination = roleRoutes[loggedInUser.role];

    if (!destination) {
      throw new Error("Your account has an unsupported role.");
    }

    navigate(destination, { replace: true });
  };

  if (authLoading) {
    return (
      <div className="new-login-loading">
        <div className="new-login-spinner"></div>
        <p>Securing your session...</p>
      </div>
    );
  }

  if (user) {
    return (
      <Navigate
        to={roleRoutes[user.role] || "/"}
        replace
      />
    );
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail || !password) {
      setError("Please enter your email and password.");
      return;
    }

    try {
      setIsSubmitting(true);

      const loggedInUser = await login(
        normalizedEmail,
        password
      );

      redirectUser(loggedInUser);
    } catch (err) {
      setError(err.message || "Unable to sign in. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setError("");

    if (!credentialResponse?.credential) {
      setError("Google did not return a valid login credential.");
      return;
    }

    try {
      setGoogleSubmitting(true);

      const loggedInUser = await loginWithGoogle(
        credentialResponse.credential
      );

      redirectUser(loggedInUser);
    } catch (err) {
      setError(err.message || "Google login failed.");
    } finally {
      setGoogleSubmitting(false);
    }
  };

  // DEVELOPMENT-ONLY DEMO LOGIN
  const handleDemoLogin = async () => {
    setError("");

    try {
      setDemoSubmitting(true);

      const loggedInUser = await loginWithDemo(
        "client",
        "aadhavan.traders.client@clientlocker.test"
      );

      redirectUser(loggedInUser);
    } catch (err) {
      setError(
        err.message || "Unable to log in with the demo account."
      );
    } finally {
      setDemoSubmitting(false);
    }
  };

  const isBusy =
    isSubmitting || googleSubmitting || demoSubmitting;

  return (
    <main className="new-login-page">

      {/* Background decoration */}
      <div className="new-login-orb new-login-orb-one"></div>
      <div className="new-login-orb new-login-orb-two"></div>

      {/* Top navigation */}
      <header className="new-login-header">
        <Link to="/" className="new-login-brand">
          <div className="new-login-brand-icon">
            <ShieldCheck size={25} />
          </div>
          <span>ClientLocker</span>
        </Link>

        <div className="new-login-header-right">
          <span>Secure workspace</span>
          <FileLock2 size={17} />
        </div>
      </header>

      {/* Main content */}
      <section className="new-login-main">

        <div className="new-login-intro">
          <span className="new-login-tag">
            YOUR SECURE DIGITAL WORKSPACE
          </span>

          <h1>
            Everything important,
            <br />
            <span>securely in one place.</span>
          </h1>

          <p>
            Sign in to manage documents, access client records
            and collaborate securely with your team.
          </p>
        </div>

        {/* Login card */}
        <div className="new-login-card">

          <div className="new-login-card-heading">
            <div className="new-login-card-icon">
              <LockKeyhole size={23} />
            </div>

            <h2>Welcome back</h2>

            <p>
              Sign in to continue to your ClientLocker account.
            </p>
          </div>

          <form onSubmit={handleSubmit}>

            {/* Email */}
            <div className="new-login-field">
              <label htmlFor="new-login-email">
                Email address
              </label>

              <div className="new-login-input">
                <Mail size={18} />

                <input
                  id="new-login-email"
                  type="email"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  autoComplete="username"
                  required
                  disabled={isBusy}
                />
              </div>
            </div>

            {/* Password */}
            <div className="new-login-field">
              <div className="new-login-password-label">
                <label htmlFor="new-login-password">
                  Password
                </label>
              </div>

              <div className="new-login-input">
                <LockKeyhole size={18} />

                <input
                  id="new-login-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  autoComplete="current-password"
                  required
                  disabled={isBusy}
                />

                <button
                  type="button"
                  className="new-login-eye"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={
                    showPassword ? "Hide password" : "Show password"
                  }
                  disabled={isBusy}
                >
                  {showPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="new-login-error" role="alert">
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              className="new-login-submit"
              disabled={isBusy}
            >
              {isSubmitting ? (
                "Signing in..."
              ) : (
                <>
                  Sign in to your account
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="new-login-divider">
            <span>OR CONTINUE WITH</span>
          </div>

          {/* Google */}
          <div className="new-login-google">
            {googleSubmitting ? (
              <p>Signing in with Google...</p>
            ) : (
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => {
                  setError("Google sign-in was unsuccessful.");
                  setGoogleSubmitting(false);
                }}
                theme="outline"
                size="large"
                text="continue_with"
                shape="rectangular"
                width="350"
                useOneTap={false}
              />
            )}
          </div>

          {/* DEVELOPMENT-ONLY DEMO LOGIN */}
          {import.meta.env.DEV && (
            <div className="new-login-demo">
              <div className="new-login-divider">
                <span>DEVELOPMENT TESTING</span>
              </div>

              <button
                type="button"
                className="new-login-demo-button"
                onClick={handleDemoLogin}
                disabled={isBusy}
              >
                <FlaskConical size={18} />

                {demoSubmitting
                  ? "Opening demo account..."
                  : "Login as Aadhavan Traders (Demo)"}
              </button>

              <p className="new-login-demo-note">
                Test account · No email or password required
              </p>
            </div>
          )}

          <div className="new-login-security">
            <ShieldCheck size={17} />
            <span>Your connection and account are protected.</span>
          </div>

        </div>

        <div className="new-login-bottom">
          <Link to="/">Back to home</Link>
          <span>© {new Date().getFullYear()} ClientLocker</span>
          <Link to="/client/login">Client access</Link>
        </div>

      </section>

    </main>
  );
}

export default Login;
