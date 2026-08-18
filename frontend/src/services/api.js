import axios from "axios";


const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:8000";


export const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});


// ============================================================
// REQUEST INTERCEPTOR
// ============================================================

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("lms_token");

    if (token) {
      config.headers = config.headers || {};

      config.headers.Authorization =
        `Bearer ${token}`;
    }

    return config;
  },

  (error) => {
    return Promise.reject(error);
  }
);


// ============================================================
// RESPONSE INTERCEPTOR
// ============================================================

api.interceptors.response.use(
  (response) => {
    return response;
  },

  (error) => {
    const status = error.response?.status;

    const responseData =
      error.response?.data;

    const message =
      responseData?.message ||
      responseData?.detail ||
      (
        Array.isArray(responseData?.errors)
          ? responseData.errors
              .map((item) => item.msg)
              .join(", ")
          : null
      ) ||
      error.message ||
      "Something went wrong. Please try again.";


    // --------------------------------------------------------
    // 401 Unauthorized
    // --------------------------------------------------------

    if (status === 401) {
      localStorage.removeItem("lms_token");
      localStorage.removeItem("lms_role");

      /*
       * Don't redirect if the user is already on auth pages.
       */
      const authPages = [
        "/login",
        "/register",
      ];

      if (
        !authPages.includes(window.location.pathname)
      ) {
        window.location.href = "/login";
      }
    }


    // --------------------------------------------------------
    // Return a normal Error to React
    // --------------------------------------------------------

    const apiError = new Error(message);

    apiError.status = status;
    apiError.response = error.response;
    apiError.data = responseData;

    return Promise.reject(apiError);
  }
);


export default api;