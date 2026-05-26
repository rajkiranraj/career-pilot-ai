import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import { supabase } from "../lib/supabase";
import { getCurrentUser, signOut } from "../services/AuthService";
import { isLaravelMode } from "../lib/backendMode";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const isMounted = useRef(true);
  const fetchingRef = useRef(false);
  const useLaravel = isLaravelMode();

  /** Merges Supabase auth user with the profiles table row. */
  const fetchUserProfile = useCallback(async (authUser) => {
    if (!authUser) {
      setUser(null);
      return;
    }

    // Guard: prevent overlapping fetches (causes state flicker)
    if (fetchingRef.current) return;
    fetchingRef.current = true;

    try {
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", authUser.id)
        .single();

      if (isMounted.current) {
        setUser({ ...authUser, ...profile });
      }
    } catch (error) {
      console.error("Profile fetch error:", error);
      // Profile may not exist yet for newly-registered users
      if (isMounted.current) {
        setUser(authUser);
      }
    } finally {
      fetchingRef.current = false;
    }
  }, []);

  /** Re-fetches and sets the current user (call after login/signup). */
  const checkUser = useCallback(async () => {
    if (useLaravel) {
      try {
        const currentUser = await getCurrentUser();
        if (isMounted.current) {
          setUser(currentUser);
        }
      } catch (error) {
        console.error("Auth error:", error);
        if (isMounted.current) {
          setUser(null);
        }
      }
      return;
    }

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      await fetchUserProfile(session?.user || null);
    } catch (error) {
      console.error("Auth error:", error);
      if (isMounted.current) {
        setUser(null);
      }
    }
  }, [fetchUserProfile, useLaravel]);

  useEffect(() => {
    isMounted.current = true;

    // --- Bootstrap session on mount ---
    const initAuth = async () => {
      if (useLaravel) {
        try {
          const currentUser = await getCurrentUser();
          if (isMounted.current) {
            setUser(currentUser);
          }
        } catch (error) {
          console.error("Init auth error:", error);
          if (isMounted.current) {
            setUser(null);
          }
        } finally {
          if (isMounted.current) {
            setLoading(false);
          }
        }
        return;
      }

      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        await fetchUserProfile(session?.user || null);
      } catch (error) {
        console.error("Init auth error:", error);
      } finally {
        if (isMounted.current) {
          setLoading(false);
        }
      }
    };

    initAuth();

    // --- Subscribe to auth changes (Supabase only) ---
    if (!useLaravel) {
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((event, session) => {
        // Skip TOKEN_REFRESHED — reacting to it causes infinite loops
        if (
          event === "SIGNED_IN" ||
          event === "SIGNED_OUT" ||
          event === "USER_UPDATED"
        ) {
          if (session?.user) {
            fetchUserProfile(session.user);
          } else {
            setUser(null);
          }
        }
      });

      return () => {
        isMounted.current = false;
        subscription?.unsubscribe();
      };
    }

    return () => {
      isMounted.current = false;
    };
  }, [fetchUserProfile, useLaravel]);

  const login = (userData) => {
    setUser(userData);
  };

  const logout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setUser(null);
      window.location.href = "/";
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, setUser, login, checkUser, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
