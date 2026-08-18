import { useEffect, useState } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import PageHeader from "../components/PageHeader";
import Skeleton from "../components/Skeleton";
import EmptyState from "../components/EmptyState";
import { reportsApi } from "../services/resources";

const COLORS = ["#1F3D33", "#B8863B", "#2E5C4C", "#D4AA66", "#A6433A", "#8F6626"];

export default function ReportsPage() {
  const [overdue, setOverdue] = useState(null);
  const [categories, setCategories] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([reportsApi.overdue(), reportsApi.popularCategories()])
      .then(([o, c]) => { setOverdue(o.data); setCategories(c.data); })
      .catch((e) => setError(e.message));
  }, []);

  if (error) return <div className="p-8"><EmptyState title="Couldn't load reports" description={error} /></div>;

  return (
    <div className="p-8">
      <PageHeader title="Reports" subtitle="Library-wide activity and trends" />

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card p-5">
          <h3 className="mb-4 text-base font-semibold text-forest-dark">Overdue Books</h3>
          {!overdue ? (
            <Skeleton className="h-64" />
          ) : overdue.length === 0 ? (
            <EmptyState title="No overdue books" description="Everything is on schedule." compact />
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="text-xs uppercase text-ink-light">
                <tr><th className="pb-2">Book</th><th className="pb-2">Due Date</th></tr>
              </thead>
              <tbody className="divide-y divide-forest/5">
                {overdue.map((row) => (
                  <tr key={row.transaction_id}>
                    <td className="py-2">{row.book_title}</td>
                    <td className="py-2 text-stamp-red">{row.due_date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="card p-5">
          <h3 className="mb-4 text-base font-semibold text-forest-dark">Popular Categories</h3>
          {!categories ? (
            <Skeleton className="h-64" />
          ) : categories.length === 0 ? (
            <EmptyState title="No borrowing history yet" compact />
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={categories} dataKey="borrow_count" nameKey="category" outerRadius={90} label>
                  {categories.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}
