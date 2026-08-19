import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  BookOpen,
  Users,
  ArrowLeftRight,
  Coins,
  BarChart3,
  MessageSquareText,
  Bell,
  MessageCircle,
  User,
  LogOut,
  BookMarked,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const NAV_ITEMS = [
  {
    to: "/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    roles: ["admin", "librarian", "member"],
  },
  {
    to: "/books",
    label: "Books",
    icon: BookOpen,
    roles: ["admin", "librarian", "member"],
  },
  {
    to: "/members",
    label: "Members",
    icon: Users,
    roles: ["admin", "librarian"],
  },
  {
    to: "/borrowed-books",
    label: "Borrow / Return",
    icon: ArrowLeftRight,
    roles: ["admin", "librarian"],
  },
  {
    to: "/my-books",
    label: "My Books",
    icon: BookMarked,
    roles: ["member"],
  },
  {
    to: "/fines",
    label: "Fines",
    icon: Coins,
    roles: ["admin", "librarian", "member"],
  },
  {
    to: "/reports",
    label: "Reports",
    icon: BarChart3,
    roles: ["admin", "librarian"],
  },
  {
    to: "/feedback",
    label: "Feedback",
    icon: MessageSquareText,
    roles: ["admin", "librarian", "member"],
  },
  {
    to: "/notifications",
    label: "Notifications",
    icon: Bell,
    roles: ["admin", "librarian", "member"],
  },
  {
    to: "/chatbot",
    label: "AI Assistant",
    icon: MessageCircle,
    roles: ["admin", "librarian", "member"],
  },
];

export default function AppLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const visibleItems = NAV_ITEMS.filter((item) =>
    item.roles.includes(user?.role)
  );

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="flex min-h-screen bg-paper">
      {/* ============================================================
          DESKTOP SIDEBAR
          ============================================================ */}
      <aside className="hidden w-64 flex-shrink-0 flex-col border-r border-forest/10 bg-forest-dark text-paper md:flex">
        {/* Brand */}
        <div className="flex items-center gap-2 border-b border-paper/10 px-6 py-5">
          <BookOpen className="text-brass-light" size={26} />

          <div className="min-w-0">
            <div className="font-display text-lg leading-tight text-paper">
              Athenaeum
            </div>

            <div className="text-[10px] uppercase tracking-widest text-paper/50">
              Library System
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {visibleItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-card px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-brass/20 text-brass-light"
                    : "text-paper/70 hover:bg-paper/5 hover:text-paper"
                }`
              }
            >
              <Icon size={18} />
              <span className="truncate">{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* User actions */}
        <div className="border-t border-paper/10 px-3 py-4">
          <NavLink
            to="/profile"
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-card px-3 py-2 text-sm font-medium ${
                isActive
                  ? "bg-paper/10 text-paper"
                  : "text-paper/70 hover:bg-paper/5 hover:text-paper"
              }`
            }
          >
            <User size={18} />
            <span className="truncate">{user?.full_name}</span>
          </NavLink>

          <button
            onClick={handleLogout}
            className="mt-1 flex w-full items-center gap-3 rounded-card px-3 py-2 text-sm font-medium text-paper/70 hover:bg-paper/5 hover:text-paper"
          >
            <LogOut size={18} />
            Log out
          </button>
        </div>
      </aside>

      {/* ============================================================
          MOBILE LAYOUT
          ============================================================ */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobile Header */}
        <header className="sticky top-0 z-30 border-b border-forest/10 bg-forest-dark text-paper md:hidden">
          <div className="flex items-center justify-between gap-3 px-4 py-3">
            <NavLink
              to="/dashboard"
              className="flex min-w-0 items-center gap-2"
            >
              <BookOpen
                className="flex-shrink-0 text-brass-light"
                size={23}
              />

              <div className="min-w-0">
                <div className="truncate font-display text-base leading-tight text-paper">
                  Athenaeum
                </div>

                <div className="text-[8px] uppercase tracking-widest text-paper/50">
                  Library System
                </div>
              </div>
            </NavLink>

            <NavLink
              to="/profile"
              className="flex min-w-0 max-w-[45%] items-center gap-2 rounded-card px-2 py-1.5 text-paper/80 hover:bg-paper/10"
            >
              <User size={17} className="flex-shrink-0" />

              <span className="truncate text-xs font-medium">
                {user?.full_name}
              </span>
            </NavLink>
          </div>

          {/* Horizontal mobile navigation */}
          <nav className="flex gap-1 overflow-x-auto px-3 pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {visibleItems.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `flex flex-shrink-0 items-center gap-1.5 rounded-card px-3 py-2 text-xs font-medium transition-colors ${
                    isActive
                      ? "bg-brass/20 text-brass-light"
                      : "bg-paper/5 text-paper/70 hover:bg-paper/10 hover:text-paper"
                  }`
                }
              >
                <Icon size={15} />
                <span>{label}</span>
              </NavLink>
            ))}
          </nav>
        </header>

        {/* Main content */}
        <main className="min-w-0 flex-1 overflow-x-hidden">
          <Outlet />
        </main>

        {/* Mobile logout */}
        <div className="border-t border-forest/10 bg-white px-4 py-3 md:hidden">
          <div className="flex items-center justify-between gap-3">
            <NavLink
              to="/profile"
              className="flex min-w-0 items-center gap-2 text-sm font-medium text-forest-dark"
            >
              <User size={17} />
              <span className="truncate">Profile</span>
            </NavLink>

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 rounded-card px-3 py-2 text-sm font-medium text-stamp-red hover:bg-stamp-red/5"
            >
              <LogOut size={16} />
              Log out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

