import { useEffect, useState } from "react";
import PageHeader from "../components/PageHeader";
import Skeleton from "../components/Skeleton";
import EmptyState from "../components/EmptyState";
import StatusStamp from "../components/StatusStamp";
import { borrowApi } from "../services/resources";

export default function MyBooksPage() {
  const [transactions, setTransactions] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    borrowApi.mine().then((r) => setTransactions(r.data)).catch((e) => setError(e.message));
  }, []);

  return (
    <div className="p-8">
      <PageHeader title="My Books" subtitle="Your current and past borrowing history" />

      {error ? (
        <EmptyState title="Couldn't load your books" description={error} />
      ) : !transactions ? (
        <Skeleton className="h-72" />
      ) : transactions.length === 0 ? (
        <EmptyState title="You haven't borrowed any books yet" description="Browse the catalog to find your next read." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {transactions.map((t) => (
            <div key={t.id} className="card p-4">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-semibold text-forest-dark">{t.book.title}</h3>
                <StatusStamp status={t.status} />
              </div>
              <div className="mt-3 space-y-1 text-xs text-ink-light">
                <div>Issued: {t.issue_date}</div>
                <div>Due: {t.due_date}</div>
                {t.return_date && <div>Returned: {t.return_date}</div>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
