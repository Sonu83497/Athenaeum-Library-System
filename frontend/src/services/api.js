import axios from "axios";

/*
|--------------------------------------------------------------------------
| API BASE URL
|--------------------------------------------------------------------------
| Local:
|   VITE_API_URL=http://localhost:8000
|
| Production:
|   VITE_API_URL=https://athenaeum-library-system-2.onrender.com
|
| IMPORTANT:
| Do NOT add /api here because individual endpoints already use /api/...
|--------------------------------------------------------------------------
*/

const API_URL = (
  import.meta.env.VITE_API_URL ||
  "https://athenaeum-library-system-2.onrender.com"
).replace(/\/+$/, "");


/*
|--------------------------------------------------------------------------
| Axios Instance
|--------------------------------------------------------------------------
*/

export const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});


/*
|--------------------------------------------------------------------------
| REQUEST INTERCEPTOR
|--------------------------------------------------------------------------
| Automatically attaches JWT token to every protected request.
|--------------------------------------------------------------------------
*/

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("lms_token");

    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);


/*
|--------------------------------------------------------------------------
| RESPONSE INTERCEPTOR
|--------------------------------------------------------------------------
*/

api.interceptors.response.use(
  (response) => response,

  (error) => {
    const status = error.response?.status;
    const data = error.response?.data;

    let message = "Something went wrong. Please try again.";

    /*
     * Backend standard error:
     * {
     *   success: false,
     *   message: "..."
     * }
     */
    if (typeof data?.message === "string") {
      message = data.message;
    }

    /*
     * FastAPI validation error:
     * {
     *   success: false,
     *   message: "Validation error",
     *   errors: [...]
     * }
     */
    else if (Array.isArray(data?.errors)) {
      message = data.errors
        .map((item) => {
          if (typeof item === "string") {
            return item;
          }

          const field = Array.isArray(item?.loc)
            ? item.loc.filter(
                (part) =>
                  part !== "body" &&
                  part !== "query" &&
                  part !== "path"
              ).join(".")
            : "";

          const msg = item?.msg || "Validation error";

          return field ? `${field}: ${msg}` : msg;
        })
        .join(", ");
    }

    /*
     * FastAPI default detail
     */
    else if (typeof data?.detail === "string") {
      message = data.detail;
    }

    /*
     * Network / Axios error
     */
    else if (error.code === "ECONNABORTED") {
      message =
        "The server took too long to respond. Please try again.";
    }

    else if (
      error.code === "ERR_NETWORK" ||
      error.message === "Network Error"
    ) {
      message =
        "Unable to connect to the library server. Please check that the backend is running.";
    }

    else if (error.message) {
      message = error.message;
    }


    /*
    |--------------------------------------------------------------------------
    | 401 Unauthorized
    |--------------------------------------------------------------------------
    */

    if (status === 401) {
      localStorage.removeItem("lms_token");
      localStorage.removeItem("lms_role");

      const authPages = [
        "/login",
        "/register",
      ];

      const currentPath = window.location.pathname;

      if (!authPages.includes(currentPath)) {
        window.location.href = "/login";
      }
    }


    /*
    |--------------------------------------------------------------------------
    | Create a clean application error
    |--------------------------------------------------------------------------
    */

    const apiError = new Error(message);

    apiError.status = status;
    apiError.response = error.response;
    apiError.data = data;
    apiError.code = error.code;

    return Promise.reject(apiError);
  }
);


/*
|--------------------------------------------------------------------------
| API HEALTH CHECK
|--------------------------------------------------------------------------
| Useful for quickly checking whether Render backend is reachable.
|--------------------------------------------------------------------------
*/

export const checkApiHealth = async () => {
  const response = await api.get("/api/health");
  return response.data;
};


export default api;