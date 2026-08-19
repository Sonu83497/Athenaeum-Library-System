import { useState } from "react";
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
  Menu,
  X,
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

function Brand() {
  return (
    <div className="flex items-center gap-2">
      <BookOpen className="text-brass-light" size={26} />
      <div>
        <div className="font-display text-lg leading-tight text-paper">
          Athenaeum
        </div>
        <div className="text-[10px] uppercase tracking-widest text-paper/50">
          Library System
        </div>
      </div>
    </div>
  );
}

export default function AppLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const visibleItems = NAV_ITEMS.filter((item) =>
    item.roles.includes(user?.role)
  );

  const handleLogout = () => {
    setMobileMenuOpen(false);
    logout();
    navigate("/login");
  };

  const handleNavigation = () => {
    setMobileMenuOpen(false);
  };

  return (
    <div className="flex min-h-screen bg-paper">
      {/* =========================================================
          DESKTOP SIDEBAR
          ========================================================= */}
      <aside className="hidden w-64 flex-shrink-0 flex-col border-r border-forest/10 bg-forest-dark text-paper md:flex">
        <div className="flex items-center gap-2 border-b border-paper/10 px-6 py-5">
          <Brand />
        </div>

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
              {label}
            </NavLink>
          ))}
        </nav>

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

      {/* =========================================================
          MOBILE OVERLAY
          ========================================================= */}
      {mobileMenuOpen && (
        <button
          type="button"
          aria-label="Close navigation"
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 z-40 bg-ink/50 backdrop-blur-[2px] md:hidden"
        />
      )}

      {/* =========================================================
          MOBILE DRAWER
          ========================================================= */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[280px] max-w-[85vw] flex-col bg-forest-dark text-paper shadow-2xl transition-transform duration-300 ease-out md:hidden ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Mobile drawer header */}
        <div className="flex items-center justify-between border-b border-paper/10 px-5 py-5">
          <Brand />

          <button
            type="button"
            onClick={() => setMobileMenuOpen(false)}
            aria-label="Close menu"
            className="flex h-9 w-9 items-center justify-center rounded-card text-paper/70 transition-colors hover:bg-paper/10 hover:text-paper"
          >
            <X size={21} />
          </button>
        </div>

        {/* Mobile navigation */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {visibleItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={handleNavigation}
              className={({ isActive }) =>
                `flex min-h-[44px] items-center gap-3 rounded-card px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-brass/20 text-brass-light"
                    : "text-paper/70 hover:bg-paper/5 hover:text-paper"
                }`
              }
            >
              <Icon size={19} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Mobile profile + logout */}
        <div className="border-t border-paper/10 px-3 py-4">
          <NavLink
            to="/profile"
            onClick={handleNavigation}
            className={({ isActive }) =>
              `flex min-h-[44px] items-center gap-3 rounded-card px-3 py-2.5 text-sm font-medium ${
                isActive
                  ? "bg-paper/10 text-paper"
                  : "text-paper/70 hover:bg-paper/5 hover:text-paper"
              }`
            }
          >
            <User size={19} />
            <span className="truncate">{user?.full_name}</span>
          </NavLink>

          <button
            onClick={handleLogout}
            className="mt-1 flex min-h-[44px] w-full items-center gap-3 rounded-card px-3 py-2.5 text-sm font-medium text-paper/70 hover:bg-paper/5 hover:text-paper"
          >
            <LogOut size={19} />
            Log out
          </button>
        </div>
      </aside>

      {/* =========================================================
          MAIN CONTENT
          ========================================================= */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobile top bar */}
        <header className="sticky top-0 z-30 flex h-16 items-center border-b border-forest/10 bg-paper/95 px-4 backdrop-blur md:hidden">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Open navigation menu"
            aria-expanded={mobileMenuOpen}
            className="flex h-10 w-10 items-center justify-center rounded-card border border-forest/10 bg-white text-forest-dark shadow-sm transition-colors hover:bg-paper-dim active:scale-95"
          >
            <Menu size={22} />
          </button>

          <div className="ml-3 flex items-center gap-2">
            <BookOpen size={21} className="text-forest" />

            <div>
              <div className="font-display text-base leading-tight text-forest-dark">
                Athenaeum
              </div>
              <div className="text-[8px] uppercase tracking-widest text-ink-light">
                Library System
              </div>
            </div>
          </div>

          <NavLink
            to="/profile"
            className="ml-auto flex h-10 w-10 items-center justify-center rounded-full border border-forest/10 bg-white text-forest-dark shadow-sm"
            aria-label="Profile"
          >
            <User size={18} />
          </NavLink>
        </header>

        <main className="min-w-0 flex-1 overflow-x-hidden overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}