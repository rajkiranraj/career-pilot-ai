import axios from "axios";

/**
 * Resolves the backend API base URL, normalizing localhost aliases
 * (127.0.0.1 ↔ localhost) so the browser doesn't treat them as cross-origin.
 */
const resolveApiBaseUrl = () => {
  const configured = import.meta.env.VITE_API_URL;

  if (!configured) {
    return `${window.location.protocol}//${window.location.hostname}:8000`;
  }

  try {
    const url = new URL(configured);
    const isLocalAlias = ["localhost", "127.0.0.1"].includes(url.hostname);
    const isFrontendLocalAlias = ["localhost", "127.0.0.1"].includes(
      window.location.hostname,
    );

    if (
      isLocalAlias &&
      isFrontendLocalAlias &&
      url.hostname !== window.location.hostname
    ) {
      url.hostname = window.location.hostname;
      return url.toString().replace(/\/$/, "");
    }
  } catch {
    // fall through to raw value
  }

  return configured;
};

export const getBackendBaseUrl = () => {
  const apiUrl = resolveApiBaseUrl();

  try {
    const url = new URL(apiUrl);
    url.pathname = "";
    url.search = "";
    url.hash = "";
    return url.toString().replace(/\/$/, "");
  } catch {
    return String(apiUrl || "").replace(/\/api\/?$/, "");
  }
};

const api = axios.create({
  baseURL: getBackendBaseUrl(),
  withCredentials: true,
  withXSRFToken: true,
  xsrfCookieName: "XSRF-TOKEN",
  xsrfHeaderName: "X-XSRF-TOKEN",
  headers: {
    "X-Requested-With": "XMLHttpRequest",
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

/** Prefix non-auth requests with /api so callers don't repeat it. */
api.interceptors.request.use((config) => {
  const authRoutes = [
    "/login",
    "/register",
    "/logout",
    "/sanctum/csrf-cookie",
    "/forgot-password",
    "/reset-password",
  ];
  const url = config.url || "";
  const isAuthRoute = authRoutes.some((route) => url.startsWith(route));

  if (!isAuthRoute && !url.startsWith("http") && !url.startsWith("/api")) {
    config.url = `/api${url.startsWith("/") ? "" : "/"}${url}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      // Prevent infinite reload loop: don't redirect if the failing request is the auth check itself,
      // or if we're already on the login page.
      if (
        error.config && 
        !error.config.url.includes('/user/me') && 
        window.location.pathname !== '/login'
      ) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error.response?.data || error.message);
  },
);

export const resolveApiData = (payload) => {
  if (payload && typeof payload === "object" && "data" in payload) {
    return payload.data;
  }

  return payload;
};

export default api;
