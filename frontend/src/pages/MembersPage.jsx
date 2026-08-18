import { useEffect, useState } from "react";
import { Search, Users } from "lucide-react";
import PageHeader from "../components/PageHeader";
import Skeleton from "../components/Skeleton";
import EmptyState from "../components/EmptyState";
import { membersApi } from "../services/resources";
import { useToast } from "../context/ToastContext";

export default function MembersPage() {
  const toast = useToast();
  const [members, setMembers] = useState(null);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");

  const load = async (q) => {
    try {
      const { data } = await membersApi.list({ q: q || undefined });
      setMembers(data);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => { load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleToggleStatus = async (member) => {
    const nextStatus = member.status === "active" ? "inactive" : "active";
    try {
      await membersApi.update(member.id, { status: nextStatus });
      toast.success(`${member.full_name} marked ${nextStatus}`);
      load(query);
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="p-8">
      <PageHeader title="Members" subtitle={members ? `${members.length} members` : "Manage library membership"} />

      <form onSubmit={(e) => { e.preventDefault(); load(query); }} className="mb-6 relative max-w-sm">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-light" />
        <input className="input pl-9" placeholder="Search by name, email, or membership ID…"
          value={query} onChange={(e) => setQuery(e.target.value)} />
      </form>

      {error ? (
        <EmptyState title="Couldn't load members" description={error} />
      ) : !members ? (
        <Skeleton className="h-96" />
      ) : members.length === 0 ? (
        <EmptyState title="No members found" icon={Users} />
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-forest/10 bg-paper-dim text-xs uppercase tracking-wide text-ink-light">
              <tr>
                <th className="px-4 py-3">Member</th>
                <th className="px-4 py-3">Membership ID</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Borrowed</th>
                <th className="px-4 py-3">Outstanding Fine</th>
                <th className="px-4 py-3">Joined</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-forest/5">
              {members.map((m) => (
                <tr key={m.id}>
                  <td className="px-4 py-3">
                    <div className="font-medium text-forest-dark">{m.full_name}</div>
                    <div className="text-xs text-ink-light">{m.email}</div>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs">{m.membership_id}</td>
                  <td className="px-4 py-3">
                    <span className={m.status === "active" ? "stamp-active" : "stamp-returned"}>{m.status}</span>
                  </td>
                  <td className="px-4 py-3">{m.currently_borrowed_count}</td>
                  <td className="px-4 py-3">
                    <span className={m.outstanding_fine > 0 ? "font-semibold text-stamp-red" : ""}>
                      ${m.outstanding_fine.toFixed(2)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-ink-light">{m.join_date}</td>
                  <td className="px-4 py-3 text-right">
                    <button className="btn-secondary py-1 text-xs" onClick={() => handleToggleStatus(m)}>
                      {m.status === "active" ? "Deactivate" : "Activate"}
                    </button>
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
