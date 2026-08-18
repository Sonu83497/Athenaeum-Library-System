import { Link } from "react-router-dom";
import { BookX } from "lucide-react";

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-paper text-center">
      <BookX size={40} className="text-ink-light/40" />
      <h1 className="font-display text-2xl text-forest-dark">Page not found</h1>
      <p className="text-sm text-ink-light">This shelf doesn't exist in our catalog.</p>
      <Link to="/dashboard" className="btn-primary mt-2">Back to Dashboard</Link>
    </div>
  );
}
