import { useEffect, useState } from "react";
import { X, Loader2 } from "lucide-react";

const emptyForm = {
  isbn: "", title: "", description: "", publisher: "", publication_year: "",
  language: "English", edition: "", shelf_location: "", total_copies: 1,
  cover_image_url: "", author_names: "", category_names: "",
};

export default function BookFormModal({ open, initial, onClose, onSubmit }) {
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (initial) {
      setForm({
        ...emptyForm,
        ...initial,
        publication_year: initial.publication_year || "",
        author_names: (initial.authors || []).map((a) => a.name).join(", "),
        category_names: (initial.categories || []).map((c) => c.name).join(", "),
      });
    } else {
      setForm(emptyForm);
    }
    setError("");
  }, [initial, open]);

  if (!open) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const payload = {
        ...form,
        publication_year: form.publication_year ? Number(form.publication_year) : null,
        total_copies: Number(form.total_copies),
        author_names: form.author_names.split(",").map((s) => s.trim()).filter(Boolean),
        category_names: form.category_names.split(",").map((s) => s.trim()).filter(Boolean),
      };
      await onSubmit(payload);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-ink/40 px-4 py-8">
      <div className="card max-h-full w-full max-w-lg overflow-y-auto p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-display text-lg text-forest-dark">{initial ? "Edit Book" : "Add Book"}</h3>
          <button onClick={onClose} className="text-ink-light hover:text-ink"><X size={18} /></button>
        </div>

        {error && (
          <div className="mb-4 rounded-card border border-stamp-red/30 bg-stamp-red/5 px-3 py-2 text-sm text-stamp-red">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="label">Title</label>
            <input required className="input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </div>
          <div>
            <label className="label">ISBN</label>
            <input required disabled={!!initial} className="input" value={form.isbn}
              onChange={(e) => setForm({ ...form, isbn: e.target.value })} />
          </div>
          <div>
            <label className="label">Publication Year</label>
            <input type="number" className="input" value={form.publication_year}
              onChange={(e) => setForm({ ...form, publication_year: e.target.value })} />
          </div>
          <div>
            <label className="label">Publisher</label>
            <input className="input" value={form.publisher} onChange={(e) => setForm({ ...form, publisher: e.target.value })} />
          </div>
          <div>
            <label className="label">Total Copies</label>
            <input type="number" min={0} required className="input" value={form.total_copies}
              onChange={(e) => setForm({ ...form, total_copies: e.target.value })} />
          </div>
          <div>
            <label className="label">Language</label>
            <input className="input" value={form.language} onChange={(e) => setForm({ ...form, language: e.target.value })} />
          </div>
          <div>
            <label className="label">Shelf Location</label>
            <input className="input" value={form.shelf_location} onChange={(e) => setForm({ ...form, shelf_location: e.target.value })} />
          </div>
          <div className="col-span-2">
            <label className="label">Authors (comma-separated)</label>
            <input className="input" value={form.author_names} onChange={(e) => setForm({ ...form, author_names: e.target.value })} />
          </div>
          <div className="col-span-2">
            <label className="label">Categories (comma-separated)</label>
            <input className="input" value={form.category_names} onChange={(e) => setForm({ ...form, category_names: e.target.value })} />
          </div>
          <div className="col-span-2">
            <label className="label">Description</label>
            <textarea rows={3} className="input" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>

          <div className="col-span-2 mt-2 flex justify-end gap-3">
            <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" disabled={submitting} className="btn-primary">
              {submitting && <Loader2 size={16} className="animate-spin" />}
              {initial ? "Save changes" : "Add book"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
