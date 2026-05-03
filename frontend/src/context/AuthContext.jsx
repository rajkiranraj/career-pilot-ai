import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import { supabase } from "../lib/supabase";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const isMounted = useRef(true);
  const fetchingRef = useRef(false);

  // Fetches the profile and merges it with the auth user
  const fetchUserProfile = useCallback(async (authUser) => {
    if (!authUser) {
      setUser(null);
      return;
    }

    // Prevent overlapping fetches (the main cause of the glitch)
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
      // Still set the auth user even if profile fetch fails (new users may not have a profile yet)
      if (isMounted.current) {
        setUser(authUser);
      }
    } finally {
      fetchingRef.current = false;
    }
  }, []);

  // Public method pages can call to refresh user data
  const checkUser = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      await fetchUserProfile(session?.user || null);
    } catch (error) {
      console.error("Auth error:", error);
      if (isMounted.current) {
        setUser(null);
      }
    }
  }, [fetchUserProfile]);

  useEffect(() => {
    isMounted.current = true;

    // 1. Get the initial session
    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
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

    // 2. Listen for auth state changes (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        // Only react to meaningful auth events, skip token refreshes to avoid loops
        if (event === "SIGNED_IN" || event === "SIGNED_OUT" || event === "USER_UPDATED") {
          if (session?.user) {
            fetchUserProfile(session.user);
          } else {
            setUser(null);
          }
        }
      }
    );

    return () => {
      isMounted.current = false;
      subscription?.unsubscribe();
    };
  }, [fetchUserProfile]);

  const login = (userData) => {
    setUser(userData);
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
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
