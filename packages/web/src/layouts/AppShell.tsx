import { Outlet, Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Map,
  LayoutGrid,
  MountainSnow,
  Trophy,
  BarChart3,
  Plug,
  CreditCard,
  ShieldAlert,
  type LucideIcon,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";

const NAV_PRIMARY = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, to: "/dashboard" },
  { id: "map", label: "Exploration Map", icon: Map, to: "/map" },
  { id: "collections", label: "Collections", icon: LayoutGrid, to: "/collections" },
  { id: "regions", label: "Regions", icon: MountainSnow, to: "/regions" },
  { id: "achievements", label: "Achievements", icon: Trophy, to: "/achievements" },
];

const NAV_SECONDARY = [
  { id: "stats", label: "Statistics", icon: BarChart3, to: "/statistics" },
  { id: "sources", label: "Connected sources", icon: Plug, to: "/connected-sources" },
  { id: "plan", label: "Plan & Billing", icon: CreditCard, to: "/plan" },
];

function NavItem({
  label,
  icon: Icon,
  to,
  active,
}: {
  label: string;
  icon: LucideIcon;
  to: string;
  active: boolean;
}) {
  return (
    <Link
      to={to}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 11,
        width: "100%",
        padding: "9px 12px",
        borderRadius: "var(--radius-md)",
        border: "1px solid " + (active ? "var(--border-gold)" : "transparent"),
        background: active ? "var(--accent-soft)" : "transparent",
        color: active ? "var(--text-accent)" : "var(--text-secondary)",
        font: "var(--type-body-sm)",
        fontWeight: active ? 600 : 500,
        fontSize: 14,
        textDecoration: "none",
        transition: "background 0.15s ease, color 0.15s ease",
      }}
    >
      <Icon size={18} strokeWidth={active ? 2.3 : 2} />
      {label}
    </Link>
  );
}

export default function AppShell() {
  const { user } = useAuth();
  const { location } = useRouterState();
  const pathname = location.pathname;

  const initials = user?.name
    ? user.name.split(" ").map((p) => p[0]).filter(Boolean).slice(0, 2).join("").toUpperCase()
    : (user?.email?.[0]?.toUpperCase() ?? "?");

  const isPro = user?.plan === "pro";

  return (
    <div style={{ display: "flex", height: "100vh", background: "var(--bg-app)" }}>
      {/* Sidebar */}
      <aside style={{
        width: "var(--sidebar-w)",
        flex: "0 0 var(--sidebar-w)",
        borderRight: "1px solid var(--border-subtle)",
        background: "var(--bg-base)",
        display: "flex",
        flexDirection: "column",
        padding: "20px 14px",
        overflow: "hidden",
      }}>
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", padding: "0 8px 22px" }}>
          <img src="/atlas-logo.svg" alt="Atlas" style={{ height: 24 }} />
        </div>

        {/* Primary nav */}
        <nav style={{ display: "flex", flexDirection: "column", gap: 3 }}>
          {NAV_PRIMARY.map((n) => (
            <NavItem
              key={n.id}
              label={n.label}
              icon={n.icon}
              to={n.to}
              active={pathname === n.to || (n.to !== "/map" && pathname.startsWith(n.to))}
            />
          ))}
        </nav>

        <div style={{ height: 1, background: "var(--border-subtle)", margin: "16px 8px" }} />

        {/* Secondary nav */}
        <nav style={{ display: "flex", flexDirection: "column", gap: 3 }}>
          {NAV_SECONDARY.map((n) => (
            <NavItem
              key={n.id}
              label={n.label}
              icon={n.icon}
              to={n.to}
              active={pathname === n.to}
            />
          ))}
          {user?.isAdmin && (
            <NavItem
              label="Admin"
              icon={ShieldAlert}
              to="/admin"
              active={pathname === "/admin"}
            />
          )}
        </nav>

        {/* User card */}
        <div style={{ marginTop: "auto" }}>
          <Link
            to="/profile"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: 10,
              borderRadius: "var(--radius-md)",
              background: pathname === "/profile" ? "var(--accent-soft)" : "var(--surface-card)",
              border: `1px solid ${pathname === "/profile" ? "var(--border-gold)" : "var(--border-subtle)"}`,
              textDecoration: "none",
              transition: "background 0.15s ease, border-color 0.15s ease",
            }}
          >
            {/* Avatar */}
            <div style={{
              width: 36,
              height: 36,
              borderRadius: "var(--radius-full)",
              background: "var(--surface-raised)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "2px solid var(--border-gold)",
              fontFamily: "var(--font-display)",
              fontWeight: 700,
              fontSize: 14,
              color: "var(--text-accent)",
              flexShrink: 0,
              overflow: "hidden",
            }}>
              {user?.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.name ?? "Avatar"}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : (
                initials
              )}
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{
                fontSize: 13,
                fontWeight: 600,
                color: "var(--text-primary)",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}>
                {user?.name ?? "Explorer"}
              </div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--gold-400)" }}>
                {isPro ? "Pro" : "Free"}
              </div>
            </div>
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <div style={{
        flex: 1,
        minWidth: 0,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}>
        <Outlet />
      </div>
    </div>
  );
}
