import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  BookOpen,
  Loader2,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";


export default function LoginPage() {
  const { login } = useAuth();

  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");


  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };


  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSubmitting(true);

    try {
      const result = await login(
        form.email,
        form.password
      );

      /*
       * AuthContext normally stores:
       * - token
       * - role
       *
       * We don't need to manually choose a role here.
       */

      const role =
        result?.role ||
        localStorage.getItem("lms_role");

      let destination =
        location.state?.from?.pathname ||
        "/dashboard";

      /*
       * If the requested page is not available,
       * dashboard remains the default.
       */
      if (!destination) {
        destination = "/dashboard";
      }

      navigate(destination, {
        replace: true,
      });

      if (role) {
        toast.success(
          `Welcome back! Signed in as ${role}.`
        );
      } else {
        toast.success("Welcome back!");
      }

    } catch (err) {
      setError(
        err?.message ||
        "Unable to sign in. Please check your credentials."
      );

    } finally {
      setSubmitting(false);
    }
  };


  return (
    <div className="flex min-h-screen items-center justify-center bg-forest-dark px-4">

      <div className="w-full max-w-sm">

        {/* Header */}
        <div className="mb-8 flex flex-col items-center text-paper">

          <BookOpen
            size={36}
            className="text-brass-light"
          />

          <h1 className="mt-2 font-display text-2xl">
            Athenaeum
          </h1>

          <p className="text-sm text-paper/60">
            Sign in to your library account
          </p>

        </div>


        {/* Login Form */}
        <form
          onSubmit={handleSubmit}
          className="card space-y-4 p-6"
        >

          {/* Error */}
          {error && (
            <div className="rounded-card border border-stamp-red/30 bg-stamp-red/5 px-3 py-2 text-sm text-stamp-red">
              {error}
            </div>
          )}


          {/* Email */}
          <div>
            <label className="label">
              Email
            </label>

            <input
              name="email"
              type="email"
              required
              className="input"
              value={form.email}
              onChange={handleChange}
              placeholder="you@example.com"
              autoComplete="email"
            />
          </div>


          {/* Password */}
          <div>
            <label className="label">
              Password
            </label>

            <input
              name="password"
              type="password"
              required
              className="input"
              value={form.password}
              onChange={handleChange}
              placeholder="••••••••"
              autoComplete="current-password"
            />
          </div>


          {/* Submit */}
          <button
            type="submit"
            disabled={submitting}
            className="btn-primary w-full"
          >

            {submitting && (
              <Loader2
                size={16}
                className="animate-spin"
              />
            )}

            {submitting
              ? "Signing in..."
              : "Sign in"
            }

          </button>


          {/* Register */}
          <p className="text-center text-sm text-ink-light">

            No account?{" "}

            <Link
              to="/register"
              className="font-semibold text-forest"
            >
              Register
            </Link>

          </p>

        </form>

      </div>

    </div>
  );
}