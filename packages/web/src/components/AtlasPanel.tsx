import React from "react";

interface AtlasPanelProps {
  title?: React.ReactNode;
  action?: React.ReactNode;
  children?: React.ReactNode;
  style?: React.CSSProperties;
  bodyStyle?: React.CSSProperties;
}

export function AtlasPanel({
  title,
  action,
  children,
  style = {},
  bodyStyle = {},
}: AtlasPanelProps) {
  return (
    <section
      style={{
        background: "var(--surface-card)",
        border: "1px solid var(--border-subtle)",
        borderRadius: "var(--radius-lg)",
        boxShadow: "var(--shadow-sm), var(--ring-top)",
        ...style,
      }}
    >
      {(title || action) && (
        <header
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "16px 18px",
            borderBottom: "1px solid var(--border-subtle)",
          }}
        >
          <h3
            style={{
              font: "var(--type-h3)",
              fontSize: 16,
              color: "var(--text-primary)",
              margin: 0,
            }}
          >
            {title}
          </h3>
          {action}
        </header>
      )}
      <div style={{ padding: 18, ...bodyStyle }}>{children}</div>
    </section>
  );
}
