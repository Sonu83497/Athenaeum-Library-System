import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Search, Plus, Pencil, Trash2, BookOpen } from "lucide-react";
import PageHeader from "../components/PageHeader";
import Skeleton from "../components/Skeleton";
import EmptyState from "../components/EmptyState";
import BookFormModal from "../components/BookFormModal";
import ConfirmDialog from "../components/ConfirmDialog";
import { booksApi } from "../services/resources";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

export default function BooksPage() {
  const { user } = useAuth();
  const toast = useToast();
  const isStaff = user?.role === "admin" || user?.role === "librarian";

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [availability, setAvailability] = useState("");
  const [sortBy, setSortBy] = useState("title");
  const [page, setPage] = useState(1);

  const [formOpen, setFormOpen] = useState(false);
  const [editingBook, setEditingBook] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await booksApi.list({
        q: query || undefined,
        availability: availability || undefined,
        sort_by: sortBy,
        page,
        page_size: 12,
      });
      setData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [availability, sortBy, page]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    load();
  };

  const handleCreate = async (payload) => {
    await booksApi.create(payload);
    setFormOpen(false);
    toast.success("Book added");
    load();
  };

  const handleUpdate = async (payload) => {
    await booksApi.update(editingBook.id, payload);
    setEditingBook(null);
    toast.success("Book updated");
    load();
  };

  const handleDelete = async () => {
    try {
      await booksApi.remove(deleteTarget.id);
      toast.success("Book deleted");
      setDeleteTarget(null);
      load();
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="p-8">
      <PageHeader
        title="Book Catalog"
        subtitle={data ? `${data.total} books in the collection` : "Search and manage the collection"}
        action={isStaff && (
          <button className="btn-primary" onClick={() => setFormOpen(true)}>
            <Plus size={16} /> Add Book
          </button>
        )}
      />

      <form onSubmit={handleSearchSubmit} className="mb-6 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-light" />
          <input
            className="input pl-9"
            placeholder="Search by title or ISBN…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <select className="input w-auto" value={availability} onChange={(e) => setAvailability(e.target.value)}>
          <option value="">All availability</option>
          <option value="available">Available</option>
          <option value="unavailable">Unavailable</option>
        </select>
        <select className="input w-auto" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          <option value="title">Sort: Title</option>
          <option value="newest">Sort: Newest</option>
          <option value="availability">Sort: Availability</option>
        </select>
        <button type="submit" className="btn-secondary">Search</button>
      </form>

      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-40" />)}
        </div>
      ) : error ? (
        <EmptyState title="Couldn't load books" description={error} />
      ) : data.items.length === 0 ? (
        <EmptyState title="No books found" description="Try a different search or filter." />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data.items.map((book) => (
              <div key={book.id} className="card flex flex-col p-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-14 w-11 flex-shrink-0 items-center justify-center rounded bg-forest/10 text-forest">
                    <BookOpen size={18} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <Link to={`/books/${book.id}`} className="line-clamp-2 font-semibold text-forest-dark hover:underline">
                      {book.title}
                    </Link>
                    <p className="mt-0.5 truncate text-xs text-ink-light">
                      {book.authors.map((a) => a.name).join(", ") || "Unknown author"}
                    </p>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between text-xs text-ink-light">
                  <span className="font-mono">{book.isbn}</span>
                  <span className={book.available_copies > 0 ? "font-semibold text-stamp-green" : "font-semibold text-stamp-red"}>
                    {book.available_copies}/{book.total_copies} available
                  </span>
                </div>
                {isStaff && (
                  <div className="mt-3 flex gap-2 border-t border-forest/10 pt-3">
                    <button className="btn-secondary flex-1 py-1.5 text-xs" onClick={() => setEditingBook(book)}>
                      <Pencil size={13} /> Edit
                    </button>
                    <button className="btn-danger flex-1 py-1.5 text-xs" onClick={() => setDeleteTarget(book)}>
                      <Trash2 size={13} /> Delete
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-6 flex items-center justify-between text-sm text-ink-light">
            <span>Page {data.page} of {data.total_pages}</span>
            <div className="flex gap-2">
              <button className="btn-secondary" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Previous</button>
              <button className="btn-secondary" disabled={page >= data.total_pages} onClick={() => setPage((p) => p + 1)}>Next</button>
            </div>
          </div>
        </>
      )}

      <BookFormModal open={formOpen} onClose={() => setFormOpen(false)} onSubmit={handleCreate} />
      <BookFormModal open={!!editingBook} initial={editingBook} onClose={() => setEditingBook(null)} onSubmit={handleUpdate} />
      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete this book?"
        description={`"${deleteTarget?.title}" will be permanently removed from the catalog.`}
        confirmLabel="Delete"
        danger
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
