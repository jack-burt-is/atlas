import React from "react";

interface StatBlockProps {
  value: React.ReactNode;
  label?: string | null;
  sub?: string | null;
  icon?: React.ReactNode;
  gold?: boolean;
  align?: "left" | "center" | "right";
  size?: "sm" | "md" | "lg";
  className?: string;
}

const SIZES = { sm: 30, md: 40, lg: 56 };

export function StatBlock({
  value,
  label = null,
  sub = null,
  icon = null,
  gold = false,
  align = "left",
  size = "md",
  className = "",
}: StatBlockProps) {
  const fs = SIZES[size] ?? SIZES.md;
  return (
    <div
      className={className}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 6,
        alignItems: align === "center" ? "center" : "flex-start",
        textAlign: align,
      }}
    >
      {(label || icon) && (
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            textTransform: "uppercase",
            letterSpacing: ".12em",
            color: "var(--text-muted)",
          }}
        >
          {icon}
          {label}
        </span>
      )}
      <span
        className={gold ? "atlas-gold-text" : ""}
        style={{
          fontFamily: "var(--font-display)",
          fontWeight: 700,
          lineHeight: 1,
          fontSize: fs,
          letterSpacing: "-.02em",
          fontVariantNumeric: "tabular-nums",
          whiteSpace: "nowrap",
          color: gold ? undefined : "var(--text-primary)",
        }}
      >
        {value}
      </span>
      {sub && (
        <span
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: 13,
            color: "var(--text-muted)",
          }}
        >
          {sub}
        </span>
      )}
    </div>
  );
}
