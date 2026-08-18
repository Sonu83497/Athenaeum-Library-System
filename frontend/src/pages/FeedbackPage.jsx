import { useEffect, useState } from "react";
import { Star, Trash2, CheckCircle2 } from "lucide-react";
import PageHeader from "../components/PageHeader";
import Skeleton from "../components/Skeleton";
import EmptyState from "../components/EmptyState";
import ConfirmDialog from "../components/ConfirmDialog";
import { feedbackApi } from "../services/resources";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

function StarPicker({ value, onChange }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button key={n} type="button" onClick={() => onChange(n)}>
          <Star size={22} className={n <= value ? "fill-brass text-brass" : "text-forest/20"} />
        </button>
      ))}
    </div>
  );
}

export default function FeedbackPage() {
  const { user } = useAuth();
  const toast = useToast();
  const isStaff = user?.role === "admin" || user?.role === "librarian";

  const [list, setList] = useState(null);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ rating: 5, category: "general", message: "" });
  const [submitting, setSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const load = async () => {
    try {
      if (isStaff) {
        const { data } = await feedbackApi.list();
        setList(data);
      } else {
        setList([]);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => { load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await feedbackApi.submit(form);
      toast.success("Thanks for your feedback!");
      setForm({ rating: 5, category: "general", message: "" });
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleReview = async (id) => {
    await feedbackApi.review(id);
    toast.success("Marked as reviewed");
    load();
  };

  const handleDelete = async () => {
    await feedbackApi.remove(deleteTarget.id);
    toast.success("Feedback removed");
    setDeleteTarget(null);
    load();
  };

  return (
    <div className="p-8">
      <PageHeader title="Feedback" subtitle={isStaff ? "Member feedback submissions" : "Tell us how we're doing"} />

      {!isStaff && (
        <form onSubmit={handleSubmit} className="card mb-8 max-w-lg space-y-4 p-6">
          <div>
            <label className="label">Rating</label>
            <StarPicker value={form.rating} onChange={(v) => setForm({ ...form, rating: v })} />
          </div>
          <div>
            <label className="label">Category</label>
            <select className="input" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
              <option value="general">General</option>
              <option value="books">Book Collection</option>
              <option value="service">Staff Service</option>
              <option value="facility">Facility</option>
              <option value="ai_assistant">AI Assistant</option>
            </select>
          </div>
          <div>
            <label className="label">Message</label>
            <textarea required rows={4} className="input" value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder="Share your thoughts…" />
          </div>
          <button type="submit" disabled={submitting} className="btn-primary">Submit Feedback</button>
        </form>
      )}

      {isStaff && (
        error ? (
          <EmptyState title="Couldn't load feedback" description={error} />
        ) : !list ? (
          <Skeleton className="h-72" />
        ) : list.length === 0 ? (
          <EmptyState title="No feedback yet" />
        ) : (
          <div className="space-y-3">
            {list.map((f) => (
              <div key={f.id} className="card flex items-start justify-between gap-4 p-4">
                <div>
                  <div className="flex items-center gap-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} size={14} className={i < f.rating ? "fill-brass text-brass" : "text-forest/20"} />
                    ))}
                    <span className="rounded-full bg-forest/10 px-2 py-0.5 text-xs text-forest">{f.category}</span>
                    {f.is_reviewed && (
                      <span className="flex items-center gap-1 text-xs text-stamp-green">
                        <CheckCircle2 size={12} /> Reviewed
                      </span>
                    )}
                  </div>
                  <p className="mt-2 text-sm text-ink">{f.message}</p>
                </div>
                <div className="flex flex-shrink-0 gap-2">
                  {!f.is_reviewed && (
                    <button className="btn-secondary py-1 text-xs" onClick={() => handleReview(f.id)}>Mark Reviewed</button>
                  )}
                  <button className="btn-danger py-1 text-xs" onClick={() => setDeleteTarget(f)}>
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete this feedback?"
        confirmLabel="Delete"
        danger
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
