import { Inbox } from "lucide-react";

export default function EmptyState({ title, description, action, compact = false }) {
  return (
    <div className={`flex flex-col items-center justify-center text-center ${compact ? "py-10" : "py-20"}`}>
      <Inbox size={compact ? 28 : 40} className="mb-3 text-ink-light/40" />
      <h3 className="font-display text-lg text-forest-dark">{title}</h3>
      {description && <p className="mt-1 max-w-sm text-sm text-ink-light">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
