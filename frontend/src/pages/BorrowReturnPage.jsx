import { useEffect, useState } from "react";
import { ArrowLeftRight, Search } from "lucide-react";
import PageHeader from "../components/PageHeader";
import Skeleton from "../components/Skeleton";
import EmptyState from "../components/EmptyState";
import StatusStamp from "../components/StatusStamp";
import { borrowApi, membersApi, booksApi } from "../services/resources";
import { useToast } from "../context/ToastContext";

export default function BorrowReturnPage() {
  const toast = useToast();
  const [transactions, setTransactions] = useState(null);
  const [error, setError] = useState("");

  const [memberQuery, setMemberQuery] = useState("");
  const [bookQuery, setBookQuery] = useState("");
  const [memberResults, setMemberResults] = useState([]);
  const [bookResults, setBookResults] = useState([]);
  const [selectedMember, setSelectedMember] = useState(null);
  const [selectedBook, setSelectedBook] = useState(null);
  const [issuing, setIssuing] = useState(false);

  const loadTransactions = async () => {
    try {
      const { data } = await borrowApi.listAll();
      setTransactions(data);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => { loadTransactions(); }, []);

  const searchMembers = async (q) => {
    setMemberQuery(q);
    if (q.length < 2) return setMemberResults([]);
    const { data } = await membersApi.list({ q });
    setMemberResults(data.slice(0, 5));
  };

  const searchBooks = async (q) => {
    setBookQuery(q);
    if (q.length < 2) return setBookResults([]);
    const { data } = await booksApi.list({ q, availability: "available" });
    setBookResults(data.items.slice(0, 5));
  };

  const handleIssue = async () => {
    if (!selectedMember || !selectedBook) return;
    setIssuing(true);
    try {
      await borrowApi.issue({ member_id: selectedMember.id, book_id: selectedBook.id });
      toast.success(`"${selectedBook.title}" issued to ${selectedMember.full_name}`);
      setSelectedMember(null);
      setSelectedBook(null);
      setMemberQuery("");
      setBookQuery("");
      loadTransactions();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIssuing(false);
    }
  };

  const handleReturn = async (txnId) => {
    try {
      await borrowApi.return(txnId);
      toast.success("Book returned");
      loadTransactions();
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="p-8">
      <PageHeader title="Borrow / Return" subtitle="Issue books to members and process returns" />

      <div className="card mb-8 p-5">
        <h3 className="mb-4 flex items-center gap-2 text-base font-semibold text-forest-dark">
          <ArrowLeftRight size={18} /> Issue a Book
        </h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="relative">
            <label className="label">Member</label>
            {selectedMember ? (
              <div className="input flex items-center justify-between">
                <span>{selectedMember.full_name} ({selectedMember.membership_id})</span>
                <button className="text-xs text-stamp-red" onClick={() => setSelectedMember(null)}>Change</button>
              </div>
            ) : (
              <>
                <input className="input" placeholder="Search member name or ID…" value={memberQuery}
                  onChange={(e) => searchMembers(e.target.value)} />
                {memberResults.length > 0 && (
                  <div className="absolute z-10 mt-1 w-full rounded-card border border-forest/10 bg-white shadow-lg">
                    {memberResults.map((m) => (
                      <button key={m.id} type="button"
                        className="block w-full px-3 py-2 text-left text-sm hover:bg-paper-dim"
                        onClick={() => { setSelectedMember(m); setMemberResults([]); }}>
                        {m.full_name} <span className="text-ink-light">({m.membership_id})</span>
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>

          <div className="relative">
            <label className="label">Book</label>
            {selectedBook ? (
              <div className="input flex items-center justify-between">
                <span className="truncate">{selectedBook.title}</span>
                <button className="text-xs text-stamp-red" onClick={() => setSelectedBook(null)}>Change</button>
              </div>
            ) : (
              <>
                <input className="input" placeholder="Search available books…" value={bookQuery}
                  onChange={(e) => searchBooks(e.target.value)} />
                {bookResults.length > 0 && (
                  <div className="absolute z-10 mt-1 w-full rounded-card border border-forest/10 bg-white shadow-lg">
                    {bookResults.map((b) => (
                      <button key={b.id} type="button"
                        className="block w-full px-3 py-2 text-left text-sm hover:bg-paper-dim"
                        onClick={() => { setSelectedBook(b); setBookResults([]); }}>
                        {b.title} <span className="text-ink-light">({b.available_copies} available)</span>
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
        <button className="btn-primary mt-4" disabled={!selectedMember || !selectedBook || issuing} onClick={handleIssue}>
          Issue Book
        </button>
      </div>

      <h3 className="mb-3 text-base font-semibold text-forest-dark">Active &amp; Recent Transactions</h3>
      {error ? (
        <EmptyState title="Couldn't load transactions" description={error} />
      ) : !transactions ? (
        <Skeleton className="h-72" />
      ) : transactions.length === 0 ? (
        <EmptyState title="No transactions yet" description="Issue a book above to get started." />
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-forest/10 bg-paper-dim text-xs uppercase tracking-wide text-ink-light">
              <tr>
                <th className="px-4 py-3">Book</th>
                <th className="px-4 py-3">Issue Date</th>
                <th className="px-4 py-3">Due Date</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-forest/5">
              {transactions.map((t) => (
                <tr key={t.id}>
                  <td className="px-4 py-3 font-medium text-forest-dark">{t.book.title}</td>
                  <td className="px-4 py-3">{t.issue_date}</td>
                  <td className="px-4 py-3">{t.due_date}</td>
                  <td className="px-4 py-3"><StatusStamp status={t.status} /></td>
                  <td className="px-4 py-3 text-right">
                    {t.status !== "returned" && (
                      <button className="btn-secondary py-1 text-xs" onClick={() => handleReturn(t.id)}>
                        Mark Returned
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
