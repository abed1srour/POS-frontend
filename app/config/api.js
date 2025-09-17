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

/**
 * Utility function for making authenticated API requests
 * @param {string} path - API endpoint path
 * @param {object} options - Fetch options (method, body, etc.)
 * @returns {Promise} - Fetch promise
 */
export const apiRequest = async (path, options = {}) => {
  const url = api(path);
  const headers = {
    ...getAuthHeadersFromStorage(),
    ...options.headers,
  };

  const config = {
    ...options,
    headers,
  };

  return fetch(url, config);
};

/**
 * Utility function for making GET requests
 * @param {string} path - API endpoint path
 * @param {object} options - Additional fetch options
 * @returns {Promise} - Fetch promise
 */
export const apiGet = (path, options = {}) => {
  return apiRequest(path, { method: 'GET', ...options });
};

/**
 * Utility function for making POST requests
 * @param {string} path - API endpoint path
 * @param {object} data - Request body data
 * @param {object} options - Additional fetch options
 * @returns {Promise} - Fetch promise
 */
export const apiPost = (path, data, options = {}) => {
  return apiRequest(path, {
    method: 'POST',
    body: JSON.stringify(data),
    ...options,
  });
};

/**
 * Utility function for making PUT requests
 * @param {string} path - API endpoint path
 * @param {object} data - Request body data
 * @param {object} options - Additional fetch options
 * @returns {Promise} - Fetch promise
 */
export const apiPut = (path, data, options = {}) => {
  return apiRequest(path, {
    method: 'PUT',
    body: JSON.stringify(data),
    ...options,
  });
};

/**
 * Utility function for making DELETE requests
 * @param {string} path - API endpoint path
 * @param {object} options - Additional fetch options
 * @returns {Promise} - Fetch promise
 */
export const apiDelete = (path, options = {}) => {
  return apiRequest(path, { method: 'DELETE', ...options });
};

export default {
  api,
  getApiBase,
  getAuthHeaders,
  getAuthHeadersFromStorage,
  apiRequest,
  apiGet,
  apiPost,
  apiPut,
  apiDelete,
};
