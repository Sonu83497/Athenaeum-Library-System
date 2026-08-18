import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  LineChart,
  Line,
} from "recharts";
import {
  BookOpen,
  CheckCircle2,
  Users,
  AlertTriangle,
  Coins,
  ArrowLeftRight,
  BookMarked,
} from "lucide-react";

import PageHeader from "../components/PageHeader";
import { reportsApi } from "../services/resources";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import Skeleton from "../components/Skeleton";
import EmptyState from "../components/EmptyState";

function StatCard({ icon: Icon, label, value, accent }) {
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wide text-ink-light">
          {label}
        </span>

        <Icon size={18} className={accent} />
      </div>

      <div className="mt-2 font-display text-3xl text-forest-dark">
        {value}
      </div>
    </div>
  );
}

function MemberDashboard({ user }) {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadMemberDashboard() {
      try {
        const response = await api.get("/api/reports/member-dashboard");
        setStats(response.data);
      } catch (err) {
        setError(err.message);
      }
    }

    loadMemberDashboard();
  }, []);

  if (error) {
    return (
      <div className="p-8">
        <EmptyState
          title="Couldn't load dashboard"
          description={error}
        />
      </div>
    );
  }

  return (
    <div className="p-8">
      <PageHeader
        title={`Welcome, ${user?.full_name?.split(" ")[0] || "Member"}`}
        subtitle="Your library account overview"
      />

      {!stats ? (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <StatCard
              icon={BookOpen}
              label="Total Books"
              value={stats.total_books}
              accent="text-forest"
            />

            <StatCard
              icon={CheckCircle2}
              label="Available Books"
              value={stats.available_books}
              accent="text-stamp-green"
            />

            <StatCard
              icon={BookMarked}
              label="My Borrowed Books"
              value={stats.currently_borrowed}
              accent="text-brass-dark"
            />

            <StatCard
              icon={AlertTriangle}
              label="My Overdue Books"
              value={stats.overdue_books}
              accent="text-stamp-red"
            />
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            <div className="card p-6">
              <div className="flex items-center gap-3">
                <BookOpen
                  size={22}
                  className="text-forest"
                />

                <div>
                  <h3 className="text-base font-semibold text-forest-dark">
                    Browse Books
                  </h3>

                  <p className="mt-1 text-sm text-ink-light">
                    Explore the library collection and find books you want
                    to borrow.
                  </p>
                </div>
              </div>

              <a
                href="/books"
                className="btn-primary mt-5 inline-flex"
              >
                Browse Book Catalog
              </a>
            </div>

            <div className="card p-6">
              <div className="flex items-center gap-3">
                <Coins
                  size={22}
                  className="text-stamp-red"
                />

                <div>
                  <h3 className="text-base font-semibold text-forest-dark">
                    Outstanding Fine
                  </h3>

                  <p className="mt-1 text-sm text-ink-light">
                    Your current unpaid library fines.
                  </p>
                </div>
              </div>

              <div className="mt-4 font-display text-3xl text-forest-dark">
                ${Number(stats.outstanding_fine || 0).toFixed(2)}
              </div>

              {stats.outstanding_fine > 0 && (
                <a
                  href="/fines"
                  className="mt-4 inline-flex text-sm font-semibold text-forest hover:underline"
                >
                  View my fines →
                </a>
              )}
            </div>
          </div>

          {stats.overdue_books > 0 && (
            <div className="mt-6 rounded-card border border-stamp-red/20 bg-stamp-red/5 p-5">
              <div className="flex items-start gap-3">
                <AlertTriangle
                  size={20}
                  className="mt-0.5 text-stamp-red"
                />

                <div>
                  <h3 className="font-semibold text-stamp-red">
                    Overdue books
                  </h3>

                  <p className="mt-1 text-sm text-ink-light">
                    You currently have {stats.overdue_books} overdue{" "}
                    {stats.overdue_books === 1 ? "book" : "books"}.
                    Please return them as soon as possible.
                  </p>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function StaffDashboard({ user }) {
  const [stats, setStats] = useState(null);
  const [trend, setTrend] = useState(null);
  const [popularBooks, setPopularBooks] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const [statsRes, trendRes, popularRes] =
          await Promise.all([
            reportsApi.dashboard(),
            reportsApi.borrowingTrend(6),
            reportsApi.popularBooks(),
          ]);

        setStats(statsRes.data);
        setTrend(trendRes.data);
        setPopularBooks(popularRes.data);
      } catch (err) {
        setError(err.message);
      }
    }

    load();
  }, []);

  if (error) {
    return (
      <div className="p-8">
        <EmptyState
          title="Couldn't load dashboard"
          description={error}
        />
      </div>
    );
  }

  return (
    <div className="p-8">
      <PageHeader
        title={`Welcome, ${user?.full_name?.split(" ")[0] || ""}`}
        subtitle="Live library statistics"
      />

      {!stats ? (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <StatCard
            icon={BookOpen}
            label="Total Books"
            value={stats.total_books}
            accent="text-forest"
          />

          <StatCard
            icon={CheckCircle2}
            label="Available"
            value={stats.available_books}
            accent="text-stamp-green"
          />

          <StatCard
            icon={ArrowLeftRight}
            label="Issued"
            value={stats.issued_books}
            accent="text-brass-dark"
          />

          <StatCard
            icon={Users}
            label="Total Members"
            value={stats.total_members}
            accent="text-forest"
          />

          <StatCard
            icon={Users}
            label="Active Members"
            value={stats.active_members}
            accent="text-stamp-green"
          />

          <StatCard
            icon={AlertTriangle}
            label="Overdue Books"
            value={stats.overdue_books}
            accent="text-stamp-red"
          />

          <StatCard
            icon={Coins}
            label="Outstanding Fines"
            value={`$${Number(
              stats.outstanding_fines_total
            ).toFixed(2)}`}
            accent="text-stamp-red"
          />
        </div>
      )}

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="card p-5">
          <h3 className="mb-4 text-base font-semibold text-forest-dark">
            Monthly Borrowing &amp; Returns
          </h3>

          {!trend ? (
            <Skeleton className="h-64" />
          ) : trend.monthly_borrowing.length === 0 ? (
            <EmptyState
              title="No borrowing activity yet"
              description="Issue some books to see trends here."
              compact
            />
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={trend.monthly_borrowing}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#1F3D3315"
                />

                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 12 }}
                />

                <YAxis
                  tick={{ fontSize: 12 }}
                  allowDecimals={false}
                />

                <Tooltip />

                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#1F3D33"
                  strokeWidth={2}
                  name="Borrowed"
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="card p-5">
          <h3 className="mb-4 text-base font-semibold text-forest-dark">
            Most Popular Books
          </h3>

          {!popularBooks ? (
            <Skeleton className="h-64" />
          ) : popularBooks.length === 0 ? (
            <EmptyState
              title="No borrowing history yet"
              compact
            />
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart
                data={popularBooks}
                layout="vertical"
                margin={{ left: 40 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#1F3D3315"
                />

                <XAxis
                  type="number"
                  allowDecimals={false}
                  tick={{ fontSize: 12 }}
                />

                <YAxis
                  type="category"
                  dataKey="title"
                  width={120}
                  tick={{ fontSize: 11 }}
                />

                <Tooltip />

                <Bar
                  dataKey="borrow_count"
                  fill="#B8863B"
                  radius={[0, 4, 4, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();

  const role = String(user?.role || "").toLowerCase();

  if (role === "member") {
    return <MemberDashboard user={user} />;
  }

  return <StaffDashboard user={user} />;
}