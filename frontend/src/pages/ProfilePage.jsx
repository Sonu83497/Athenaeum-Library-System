import { User, Mail, Phone, BadgeCheck, ShieldCheck } from "lucide-react";
import PageHeader from "../components/PageHeader";
import { useAuth } from "../context/AuthContext";

export default function ProfilePage() {
  const { user } = useAuth();
  if (!user) return null;

  const rows = [
    { icon: User, label: "Full Name", value: user.full_name },
    { icon: Mail, label: "Email", value: user.email },
    { icon: Phone, label: "Phone", value: user.phone || "Not provided" },
    { icon: ShieldCheck, label: "Role", value: user.role },
  ];
  if (user.membership_id) {
    rows.push({ icon: BadgeCheck, label: "Membership ID", value: user.membership_id });
  }

  return (
    <div className="p-8">
      <PageHeader title="Profile" subtitle="Your account details" />
      <div className="card max-w-lg divide-y divide-forest/10 p-2">
        {rows.map(({ icon: Icon, label, value }) => (
          <div key={label} className="flex items-center gap-4 px-4 py-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-forest/10 text-forest">
              <Icon size={16} />
            </div>
            <div>
              <div className="text-xs uppercase tracking-wide text-ink-light">{label}</div>
              <div className="font-medium text-forest-dark">{value}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
