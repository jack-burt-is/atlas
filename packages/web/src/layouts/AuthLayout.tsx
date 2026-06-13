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
          <div style={{
            fontFamily: "var(--font-display)",
            fontWeight: 700,
            fontSize: 24,
            letterSpacing: ".08em",
            color: "var(--text-primary)",
          }}>
            ATLAS
          </div>
          <div className="eyebrow" style={{ marginTop: "var(--space-2)" }}>
            Completionist outdoor exploration
          </div>
        </div>
        <Outlet />
      </div>
    </div>
  );
}
