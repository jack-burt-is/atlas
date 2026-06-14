import { Outlet } from "@tanstack/react-router";

export default function AuthLayout() {
  return (
    <div
      className="atlas-topo"
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "var(--space-6)",
      }}
    >
      <div style={{ width: "100%", maxWidth: 400 }}>
        <div style={{ textAlign: "center", marginBottom: "var(--space-7)" }}>
          <img src="/atlas-logo.svg" alt="Atlas" style={{ height: 28, marginBottom: "var(--space-2)" }} />
          <div className="eyebrow" style={{ marginTop: "var(--space-2)" }}>
            Completionist outdoor exploration
          </div>
        </div>
        <Outlet />
      </div>
    </div>
  );
}
