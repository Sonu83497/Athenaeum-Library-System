import { useEffect, useState } from "react";
import { Bell, BookCheck, RotateCcw, AlertTriangle, Coins, Info } from "lucide-react";
import PageHeader from "../components/PageHeader";
import Skeleton from "../components/Skeleton";
import EmptyState from "../components/EmptyState";
import { notificationsApi } from "../services/resources";

const ICONS = {
  book_issued: BookCheck,
  book_returned: RotateCcw,
  due_soon: AlertTriangle,
  overdue: AlertTriangle,
  fine_generated: Coins,
  general: Info,
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState(null);
  const [error, setError] = useState("");

  const load = async () => {
    try {
      const { data } = await notificationsApi.list(false);
      setNotifications(data);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => { load(); }, []);

  const handleMarkRead = async (id) => {
    await notificationsApi.markRead(id);
    load();
  };

  return (
    <div className="p-8">
      <PageHeader title="Notifications" subtitle="Updates on your books, due dates, and fines" />

      {error ? (
        <EmptyState title="Couldn't load notifications" description={error} />
      ) : !notifications ? (
        <Skeleton className="h-72" />
      ) : notifications.length === 0 ? (
        <EmptyState title="You're all caught up" description="No notifications right now." icon={Bell} />
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => {
            const Icon = ICONS[n.type] || Info;
            return (
              <button
                key={n.id}
                onClick={() => !n.is_read && handleMarkRead(n.id)}
                className={`card flex w-full items-start gap-3 p-4 text-left transition-opacity ${n.is_read ? "opacity-60" : ""}`}
              >
                <Icon size={18} className="mt-0.5 flex-shrink-0 text-forest" />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-forest-dark">{n.title}</span>
                    {!n.is_read && <span className="h-1.5 w-1.5 rounded-full bg-brass" />}
                  </div>
                  <p className="mt-0.5 text-sm text-ink-light">{n.message}</p>
                  <p className="mt-1 text-xs text-ink-light/60">{new Date(n.created_at).toLocaleString()}</p>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
