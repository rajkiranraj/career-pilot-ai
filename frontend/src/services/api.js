import axios from "axios";

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
    // Ignore invalid configured URL and fall back to raw value below.
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

// Interceptor to automatically add /api prefix to non-auth routes
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
      // Handle unauthorized
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
