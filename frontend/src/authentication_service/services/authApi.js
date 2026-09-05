import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const authApi = axios.create({
  baseURL: `${API_BASE_URL}/auth`,
  headers: {
    "Content-Type": "application/json",
  },
});

/*
 * =========================================================
 * REQUEST INTERCEPTOR
 * =========================================================
 *
 * Automatically attaches the JWT to authenticated requests.
 */

authApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("hrms_token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/*
 * =========================================================
 * RESPONSE INTERCEPTOR
 * =========================================================
 *
 * Handles expired or invalid authenticated sessions.
 *
 * Login and Forgot Password requests are not treated as
 * session-expiration events when no JWT is stored.
 */

authApi.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      const token = localStorage.getItem("hrms_token");

      if (token) {
        localStorage.removeItem("hrms_token");

        window.dispatchEvent(
          new Event("hrms:unauthorized")
        );
      }
    }

    return Promise.reject(error);
  }
);

export const getPasswordResetRequests = () =>
  authApi.get("/password-reset-requests");

export const approvePasswordResetRequest = (requestId) =>
  authApi.post(`/password-reset-requests/${requestId}/approve`);

export const rejectPasswordResetRequest = (requestId) =>
  authApi.post(`/password-reset-requests/${requestId}/reject`);

export default authApi;