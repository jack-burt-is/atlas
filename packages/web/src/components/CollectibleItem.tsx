import React from "react";

const CSS = `
.atlas-ci{
  position:relative; border-radius:var(--radius-md); overflow:hidden;
  background:var(--surface-card); border:1px solid var(--border-subtle);
  aspect-ratio:1; display:flex; flex-direction:column; align-items:stretch;
  cursor:pointer; padding:0;
  transition:transform var(--dur-quick) var(--ease-out), border-color var(--t-colors), box-shadow var(--t-colors);
  font-family:var(--font-sans);
}
.atlas-ci:hover{ transform:scale(1.04); border-color:var(--border-default); box-shadow:var(--shadow-sm); }
.atlas-ci--collected{ border-color:var(--border-gold); }
.atlas-ci--collected:hover{ box-shadow:var(--glow-gold-sm); }
.atlas-ci__img{ position:absolute; inset:0; width:100%; height:100%; object-fit:cover; }
.atlas-ci__veil{ position:absolute; inset:0; }
.atlas-ci__veil--collected{ background:linear-gradient(0deg, rgba(0,0,0,.76) 0%, rgba(0,0,0,.1) 55%, transparent 100%); }
.atlas-ci__veil--missing{ background:rgba(10,14,18,.7); }
.atlas-ci__check{
  position:absolute; top:7px; right:7px; z-index:1;
  width:20px; height:20px; border-radius:50%;
  background:var(--accent); display:grid; place-items:center;
  box-shadow:var(--glow-gold-sm); color:var(--text-on-gold);
}
.atlas-ci__body{
  position:relative; z-index:1; display:flex; flex-direction:column;
  align-items:center; justify-content:center; gap:5px;
  flex:1; padding:10px 8px; text-align:center;
}
.atlas-ci__icon{ display:flex; align-items:center; justify-content:center; }
.atlas-ci__icon--collected{ color:var(--gold-400); }
.atlas-ci__icon--missing{ color:var(--text-faint); opacity:.45; filter:grayscale(1); }
.atlas-ci__name{
  font-size:10.5px; font-weight:600; line-height:1.25;
  overflow:hidden; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical;
}
.atlas-ci__name--collected{ color:var(--text-primary); }
.atlas-ci__name--missing{ color:var(--text-faint); }
.atlas-ci__meta{
  font-family:var(--font-mono); font-size:9.5px; color:var(--text-muted);
  display:flex; align-items:center; gap:5px; justify-content:center;
}
`;

function ensure() {
  if (typeof document === "undefined") return;
  if (!document.getElementById("atlas-ci-css")) {
    const s = document.createElement("style");
    s.id = "atlas-ci-css";
    s.textContent = CSS;
    document.head.appendChild(s);
  }
}

interface CollectibleItemProps {
  name: string;
  collected?: boolean;
  image?: string | null;
  meta?: React.ReactNode;
  icon?: React.ReactNode;
  checkIcon?: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

export function CollectibleItem({
  name,
  collected = false,
  image = null,
  meta = null,
  icon = null,
  checkIcon = null,
  onClick,
  className = "",
}: CollectibleItemProps) {
  ensure();
  const cls = [
    "atlas-ci",
    collected ? "atlas-ci--collected" : "atlas-ci--missing",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button className={cls} onClick={onClick} title={name} type="button">
      {image && <img className="atlas-ci__img" src={image} alt="" />}
      <div
        className={`atlas-ci__veil atlas-ci__veil--${collected ? "collected" : "missing"}`}
      />
      {collected && checkIcon && (
        <span className="atlas-ci__check">{checkIcon}</span>
      )}
      <div className="atlas-ci__body">
        {icon && (
          <span
            className={`atlas-ci__icon atlas-ci__icon--${collected ? "collected" : "missing"}`}
          >
            {icon}
          </span>
        )}
        <span
          className={`atlas-ci__name atlas-ci__name--${collected ? "collected" : "missing"}`}
        >
          {name}
        </span>
        {meta && <span className="atlas-ci__meta">{meta}</span>}
      </div>
    </button>
  );
}
