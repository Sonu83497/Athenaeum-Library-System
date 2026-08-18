import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, BookOpen, MapPin } from "lucide-react";
import { booksApi } from "../services/resources";
import Skeleton from "../components/Skeleton";
import EmptyState from "../components/EmptyState";

export default function BookDetailPage() {
  const { id } = useParams();
  const [book, setBook] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    booksApi.get(id).then((r) => setBook(r.data)).catch((e) => setError(e.message));
  }, [id]);

  if (error) return <div className="p-8"><EmptyState title="Book not found" description={error} /></div>;
  if (!book) return <div className="p-8"><Skeleton className="h-64" /></div>;

  return (
    <div className="p-8">
      <Link to="/books" className="mb-4 inline-flex items-center gap-1 text-sm text-forest hover:underline">
        <ArrowLeft size={14} /> Back to catalog
      </Link>

      <div className="card p-6">
        <div className="flex items-start gap-5">
          <div className="flex h-28 w-20 flex-shrink-0 items-center justify-center rounded bg-forest/10 text-forest">
            <BookOpen size={32} />
          </div>
          <div className="flex-1">
            <h1 className="font-display text-2xl text-forest-dark">{book.title}</h1>
            <p className="mt-1 text-ink-light">{book.authors.map((a) => a.name).join(", ") || "Unknown author"}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {book.categories.map((c) => (
                <span key={c.id} className="rounded-full bg-brass/10 px-3 py-1 text-xs font-medium text-brass-dark">
                  {c.name}
                </span>
              ))}
            </div>
          </div>
          <div className="text-right">
            <div className={`text-2xl font-semibold ${book.available_copies > 0 ? "text-stamp-green" : "text-stamp-red"}`}>
              {book.available_copies}/{book.total_copies}
            </div>
            <div className="text-xs text-ink-light">copies available</div>
          </div>
        </div>

        {book.description && <p className="mt-5 text-sm leading-relaxed text-ink">{book.description}</p>}

        <div className="mt-6 grid grid-cols-2 gap-4 border-t border-forest/10 pt-5 text-sm sm:grid-cols-3">
          <div><div className="label">ISBN</div><div className="font-mono">{book.isbn}</div></div>
          <div><div className="label">Publisher</div><div>{book.publisher || "—"}</div></div>
          <div><div className="label">Year</div><div>{book.publication_year || "—"}</div></div>
          <div><div className="label">Language</div><div>{book.language}</div></div>
          <div><div className="label">Edition</div><div>{book.edition || "—"}</div></div>
          <div>
            <div className="label">Shelf</div>
            <div className="flex items-center gap-1">
              {book.shelf_location ? <><MapPin size={13} /> {book.shelf_location}</> : "—"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
