
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState
} from "react";

import {
  loginUser,
  getCurrentUser,
  googleLoginUser,
  demoLoginUser
} from "../services/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // ==========================================
  // RESTORE THIS TAB'S LOGIN SESSION
  // ==========================================

  useEffect(() => {
    let isMounted = true;

    const restoreSession = async () => {
      const token = sessionStorage.getItem("token");

      if (!token) {
        if (isMounted) setLoading(false);
        return;
      }

      try {
        const response = await getCurrentUser();

        if (isMounted && response.success) {
          setUser(response.user);

          sessionStorage.setItem(
            "user",
            JSON.stringify(response.user)
          );
        } else if (isMounted) {
          sessionStorage.removeItem("token");
          sessionStorage.removeItem("user");
          setUser(null);
        }
      } catch (error) {
        sessionStorage.removeItem("token");
        sessionStorage.removeItem("user");

        if (isMounted) setUser(null);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    restoreSession();

    return () => {
      isMounted = false;
    };
  }, []);

  // ==========================================
  // SAVE AUTHENTICATED SESSION
  // ==========================================

  const saveSession = useCallback((response) => {
    if (
      !response?.success ||
      !response?.token ||
      !response?.user
    ) {
      throw new Error(
        response?.message || "Authentication failed."
      );
    }

    if (response.user.is_active !== true) {
      throw new Error("Your account is inactive.");
    }

    const allowedRoles = [
      "partner",
      "staff",
      "client",
      "auditor"
    ];

    if (!allowedRoles.includes(response.user.role)) {
      throw new Error("Unsupported account role.");
    }

    if (
      response.user.role === "client" &&
      !response.user.client_id
    ) {
      throw new Error("Your client account is not configured.");
    }

    // Save authentication only in this browser tab.
    sessionStorage.setItem("token", response.token);

    sessionStorage.setItem(
      "user",
      JSON.stringify(response.user)
    );

    setUser(response.user);

    return response.user;
  }, []);

  // ==========================================
  // EMAIL AND PASSWORD LOGIN
  // ==========================================

  const login = useCallback(async (email, password) => {
    const response = await loginUser({
      email,
      password
    });

    return saveSession(response);
  }, [saveSession]);

  // ==========================================
  // GOOGLE LOGIN
  // ==========================================

  const loginWithGoogle = useCallback(async (credential) => {
    if (!credential) {
      throw new Error("Google credential is missing.");
    }

    const response = await googleLoginUser(credential);

    return saveSession(response);
  }, [saveSession]);

  // ==========================================
  // DEVELOPMENT-ONLY DEMO LOGIN
  // ==========================================

  const loginWithDemo = useCallback(async (role, email) => {
    const response = await demoLoginUser({
      role,
      email
    });

    return saveSession(response);
  }, [saveSession]);

  // ==========================================
  // CLIENT MAGIC-LINK LOGIN
  // ==========================================

  const loginWithMagicLink = useCallback((response) => {
    if (response?.user?.role !== "client") {
      throw new Error(
        "Magic-link login is only available for client accounts."
      );
    }

    return saveSession(response);
  }, [saveSession]);

  // ==========================================
  // LOGOUT
  // ==========================================

  const logout = useCallback(() => {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");

    setUser(null);
  }, []);

  // ==========================================
  // AUTHENTICATION CONTEXT
  // ==========================================

  const value = {
    user,
    loading,
    isAuthenticated: Boolean(user),
    login,
    loginWithGoogle,
    loginWithDemo,
    loginWithMagicLink,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// ==========================================
// CUSTOM AUTHENTICATION HOOK
// ==========================================

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside an AuthProvider."
    );
  }

  return context;
};
