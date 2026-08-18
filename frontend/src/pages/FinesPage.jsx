import { useEffect, useState } from "react";
import PageHeader from "../components/PageHeader";
import Skeleton from "../components/Skeleton";
import EmptyState from "../components/EmptyState";
import StatusStamp from "../components/StatusStamp";
import { finesApi } from "../services/resources";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

export default function FinesPage() {
  const { user } = useAuth();
  const toast = useToast();
  const isStaff = user?.role === "admin" || user?.role === "librarian";
  const [fines, setFines] = useState(null);
  const [error, setError] = useState("");

  const load = async () => {
    try {
      const { data } = isStaff ? await finesApi.list() : await finesApi.mine();
      setFines(data);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => { load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handlePay = async (fineId) => {
    try {
      await finesApi.pay(fineId);
      toast.success("Fine marked as paid");
      load();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const unpaidTotal = fines?.filter((f) => f.status === "unpaid").reduce((sum, f) => sum + f.amount, 0) || 0;

  return (
    <div className="p-8">
      <PageHeader
        title="Fines"
        subtitle={fines ? `${fines.length} record(s) · $${unpaidTotal.toFixed(2)} outstanding` : "Overdue fine records"}
      />

      {error ? (
        <EmptyState title="Couldn't load fines" description={error} />
      ) : !fines ? (
        <Skeleton className="h-72" />
      ) : fines.length === 0 ? (
        <EmptyState title="No fines on record" description="Nice — everything's been returned on time." />
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-forest/10 bg-paper-dim text-xs uppercase tracking-wide text-ink-light">
              <tr>
                <th className="px-4 py-3">Fine ID</th>
                <th className="px-4 py-3">Overdue Days</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Status</th>
                {isStaff && <th className="px-4 py-3"></th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-forest/5">
              {fines.map((f) => (
                <tr key={f.id}>
                  <td className="px-4 py-3 font-mono text-xs">#{f.id}</td>
                  <td className="px-4 py-3">{f.overdue_days}</td>
                  <td className="px-4 py-3 font-semibold">${f.amount.toFixed(2)}</td>
                  <td className="px-4 py-3"><StatusStamp status={f.status} /></td>
                  {isStaff && (
                    <td className="px-4 py-3 text-right">
                      {f.status === "unpaid" && (
                        <button className="btn-secondary py-1 text-xs" onClick={() => handlePay(f.id)}>
                          Mark Paid
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
