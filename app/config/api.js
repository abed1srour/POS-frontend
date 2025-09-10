/**
 * API Configuration
 * 
 * This file centralizes the API configuration for the frontend.
 * The API URL is determined by the NEXT_PUBLIC_API_URL environment variable.
 * 
 * To set the backend URL, create a .env.local file in the frontend directory with:
 * NEXT_PUBLIC_API_URL=http://localhost:5001
 * 
 * Or set it in your deployment environment.
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

/**
 * Creates a full API URL by combining the base URL with the path
 * @param {string} path - The API endpoint path (e.g., "/api/products")
 * @returns {string} - The complete API URL
 */
export const api = (path) => {
  // Ensure path starts with /
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE}${normalizedPath}`;
};

/**
 * Gets the base API URL
 * @returns {string} - The base API URL
 */
export const getApiBase = () => API_BASE;

/**
 * Default headers for API requests
 * @param {string} token - Optional authentication token
 * @returns {object} - Headers object
 */
export const getAuthHeaders = (token = null) => {
  const headers = {
    "Content-Type": "application/json",
  };
  
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  
  return headers;
};

/**
 * Gets authentication headers from localStorage/sessionStorage
 * @returns {object} - Headers object with auth token if available
 */
export const getAuthHeadersFromStorage = () => {
  const token = (typeof window !== "undefined" && 
    (localStorage.getItem("auth_token") || sessionStorage.getItem("auth_token"))) || "";
  
  return getAuthHeaders(token);
};

export default {
  api,
  getApiBase,
  getAuthHeaders,
  getAuthHeadersFromStorage,
};
