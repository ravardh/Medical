import axios from "axios";
import Cookies from "js-cookie";

// Determine the base URL based on environment
const getBaseURL = () => {
  // Use environment variable from .env.development or .env.production
  return import.meta.env.VITE_API_BASE_URL;
};

// Create the Axios instance
const axiosInstance = axios.create({
  baseURL: getBaseURL(),
  withCredentials: true, // Ensures cookies are sent with requests
});

// Add request interceptor to include auth token from localStorage
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      //console.log("🔑 Adding Authorization header to request");
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle authentication errors
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Check if the error is due to expired/invalid token
    if (error.response && error.response.status === 401) {
      // Clear auth data from localStorage
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminInfo');
      
      // Dispatch a custom event to notify AuthContext
      window.dispatchEvent(new Event('auth-logout'));
      
      // Redirect to login page
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Log the current API configuration for debugging
// console.log(`🌐 API Base URL: ${getBaseURL()}`);
// console.log(`🔧 Environment: ${import.meta.env.MODE}`);



export default axiosInstance;
