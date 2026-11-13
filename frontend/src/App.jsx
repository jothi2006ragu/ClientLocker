
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate
} from "react-router-dom";

import { AuthProvider, useAuth } from "./context/AuthContext";

import MainLayout from "./components/layout/MainLayout";

// Public pages
import Home from "./pages/public/Home";
import About from "./pages/public/About";

// Authentication
import Login from "./pages/auth/Login";

// Partner pages
import PartnerDashboard from "./pages/partner/PartnerDashboard";
import PartnerClients from "./pages/partner/PartnerClients";

// Staff pages
import StaffDashboard from "./pages/staff/StaffDashboard";
import StaffClientDetails from "./pages/staff/StaffClientDetails";
import StaffFileUpload from "./pages/staff/StaffFileUpload";

// Client pages
import ClientDashboard from "./pages/client/ClientDashboard";

// ==========================================
// AUTHENTICATION LOADING
// ==========================================

function AuthLoading() {
  return (
    <div className="auth-loading">
      <div className="auth-spinner"></div>
      <p>Loading ClientLocker...</p>
    </div>
  );
}

// ==========================================
// ROLE PROTECTED ROUTE
// ==========================================

function RoleProtectedRoute({ children, allowedRoles }) {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return <AuthLoading />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user?.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

// ==========================================
// DASHBOARD REDIRECT
// ==========================================

function DashboardRedirect() {
  const { user, loading } = useAuth();

  if (loading) {
    return <AuthLoading />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const roleRoutes = {
    partner: "/partner/dashboard",
    staff: "/staff/dashboard",
    client: "/client/dashboard"
  };

  return (
    <Navigate
      to={roleRoutes[user.role] || "/login"}
      replace
    />
  );
}

// ==========================================
// MAIN APPLICATION ROUTES - M2 ONLY
// ==========================================

function AppRoutes() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>

      {/* ======================================
          PUBLIC WEBSITE
      ====================================== */}

      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
      </Route>

      {/* ======================================
          LOGIN
      ====================================== */}

      <Route
        path="/login"
        element={
          isAuthenticated
            ? <DashboardRedirect />
            : <Login />
        }
      />

      {/* ======================================
          MAIN DASHBOARD REDIRECT
      ====================================== */}

      <Route
        path="/dashboard"
        element={<DashboardRedirect />}
      />

      {/* ======================================
          PARTNER ROUTES - M2
      ====================================== */}

      <Route
        path="/partner/dashboard"
        element={
          <RoleProtectedRoute allowedRoles={["partner"]}>
            <PartnerDashboard />
          </RoleProtectedRoute>
        }
      />

      <Route
        path="/partner/clients"
        element={
          <RoleProtectedRoute allowedRoles={["partner"]}>
            <PartnerClients />
          </RoleProtectedRoute>
        }
      />

      {/* ======================================
          STAFF ROUTES - M2
      ====================================== */}

      <Route
        path="/staff"
        element={
          <RoleProtectedRoute allowedRoles={["staff"]}>
            <Navigate to="/staff/dashboard" replace />
          </RoleProtectedRoute>
        }
      />

      <Route
        path="/staff/dashboard"
        element={
          <RoleProtectedRoute allowedRoles={["staff"]}>
            <StaffDashboard />
          </RoleProtectedRoute>
        }
      />

      <Route
        path="/staff/clients/:clientId"
        element={
          <RoleProtectedRoute allowedRoles={["staff"]}>
            <StaffClientDetails />
          </RoleProtectedRoute>
        }
      />

      <Route
        path="/staff/clients/:clientId/upload"
        element={
          <RoleProtectedRoute allowedRoles={["staff"]}>
            <StaffFileUpload />
          </RoleProtectedRoute>
        }
      />

      {/* ======================================
          CLIENT ROUTES - M2
      ====================================== */}

      <Route
        path="/client/dashboard"
        element={
          <RoleProtectedRoute allowedRoles={["client"]}>
            <ClientDashboard />
          </RoleProtectedRoute>
        }
      />

      {/* ======================================
          UNKNOWN ROUTES
      ====================================== */}

      <Route
        path="*"
        element={<Navigate to="/" replace />}
      />

    </Routes>
  );
}

// ==========================================
// MAIN APPLICATION
// ==========================================

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
