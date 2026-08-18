import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BookOpen, Loader2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

export default function RegisterPage() {
  const { register } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    role: "member",
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

    // Frontend password validation
    if (form.password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    if (!/[A-Za-z]/.test(form.password)) {
      setError("Password must contain at least one letter.");
      return;
    }

    if (!/\d/.test(form.password)) {
      setError("Password must contain at least one digit.");
      return;
    }

    setSubmitting(true);

    try {
      await register({
        full_name: form.full_name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || null,
        role: form.role,
        password: form.password,
      });

      toast.success("Account created successfully — welcome to the library!");

      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(
        err?.message ||
          "Unable to create account. Please check your details and try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-forest-dark px-4 py-8">
      <div className="w-full max-w-sm">
        {/* Header */}
        <div className="mb-8 flex flex-col items-center text-paper">
          <BookOpen size={36} className="text-brass-light" />

          <h1 className="mt-2 font-display text-2xl">
            Join Athenaeum
          </h1>

          <p className="text-sm text-paper/60">
            Create your library account
          </p>
        </div>

        {/* Registration Form */}
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

          {/* Full Name */}
          <div>
            <label className="label" htmlFor="full_name">
              Full name
            </label>

            <input
              id="full_name"
              name="full_name"
              type="text"
              required
              autoComplete="name"
              className="input"
              value={form.full_name}
              onChange={handleChange}
              placeholder="Enter full name"
            />
          </div>

          {/* Email */}
          <div>
            <label className="label" htmlFor="email">
              Email
            </label>

            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              className="input"
              value={form.email}
              onChange={handleChange}
              placeholder="you@example.com"
            />
          </div>

          {/* Phone */}
          <div>
            <label className="label" htmlFor="phone">
              Phone (optional)
            </label>

            <input
              id="phone"
              name="phone"
              type="tel"
              autoComplete="tel"
              className="input"
              value={form.phone}
              onChange={handleChange}
              placeholder="9876543210"
            />
          </div>

          {/* Account Type */}
          <div>
            <label className="label" htmlFor="role">
              Account type
            </label>

            <select
              id="role"
              name="role"
              className="input"
              value={form.role}
              onChange={handleChange}
              required
            >
              <option value="member">Member</option>
              <option value="librarian">Librarian</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          {/* Password */}
          <div>
            <label className="label" htmlFor="password">
              Password
            </label>

            <input
              id="password"
              name="password"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              className="input"
              value={form.password}
              onChange={handleChange}
              placeholder="At least 8 characters, 1 letter, 1 number"
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

            {submitting ? "Creating account..." : "Create account"}
          </button>

          {/* Login Link */}
          <p className="text-center text-sm text-ink-light">
            Already registered?{" "}
            <Link
              to="/login"
              className="font-semibold text-forest"
            >
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}