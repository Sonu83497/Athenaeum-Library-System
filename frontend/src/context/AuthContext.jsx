import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import { authApi } from "../services/resources";


const AuthContext = createContext(null);


export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);


  // ============================================================
  // LOAD CURRENT USER
  // ============================================================

  const loadCurrentUser = async () => {
    const token = localStorage.getItem("lms_token");

    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const { data } = await authApi.me();

      setUser(data);

      // Keep role synchronized with backend
      if (data?.role) {
        localStorage.setItem(
          "lms_role",
          data.role
        );
      }

    } catch (error) {
      console.error(
        "Unable to load current user:",
        error
      );

      localStorage.removeItem("lms_token");
      localStorage.removeItem("lms_role");

      setUser(null);

    } finally {
      setLoading(false);
    }
  };


  // ============================================================
  // INITIAL LOAD
  // ============================================================

  useEffect(() => {
    loadCurrentUser();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  // ============================================================
  // LOGIN
  // ============================================================

  const login = async (email, password) => {
    /*
     * Backend determines whether this account is:
     *
     * member
     * librarian
     * admin
     */

    const { data } = await authApi.login({
      email,
      password,
    });


    // Save JWT
    localStorage.setItem(
      "lms_token",
      data.access_token
    );


    // Save role returned by backend
    if (data.role) {
      localStorage.setItem(
        "lms_role",
        data.role
      );
    }


    // Load complete user profile
    const { data: currentUser } =
      await authApi.me();


    setUser(currentUser);


    // Make sure role matches /me response
    if (currentUser?.role) {
      localStorage.setItem(
        "lms_role",
        currentUser.role
      );
    }


    return currentUser;
  };


  // ============================================================
  // REGISTER
  // ============================================================

  const register = async (payload) => {
    /*
     * payload now contains:
     *
     * {
     *   full_name,
     *   email,
     *   phone,
     *   password,
     *   role
     * }
     *
     * Example:
     * role: "member"
     * role: "librarian"
     * role: "admin"
     */


    // Create account
    await authApi.register(payload);


    /*
     * Automatically login after successful registration.
     * This means user doesn't have to enter credentials twice.
     */

    const currentUser = await login(
      payload.email,
      payload.password
    );


    return currentUser;
  };


  // ============================================================
  // LOGOUT
  // ============================================================

  const logout = () => {
    localStorage.removeItem("lms_token");
    localStorage.removeItem("lms_role");

    setUser(null);
  };


  // ============================================================
  // AUTH CONTEXT
  // ============================================================

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        refresh: loadCurrentUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}


// ============================================================
// useAuth HOOK
// ============================================================

export function useAuth() {
  const ctx = useContext(AuthContext);

  if (!ctx) {
    throw new Error(
      "useAuth must be used within AuthProvider"
    );
  }

  return ctx;
}