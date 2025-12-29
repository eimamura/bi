"use client";

interface BreadcrumbItem {
  label: string;
  onClick?: () => void;
}

interface BreadcrumbProps {
  title: string;
  items: BreadcrumbItem[];
}

export default function Breadcrumb({ title, items }: BreadcrumbProps) {
  return (
    <div style={{ fontSize: "0.875rem", display: "inline-flex", alignItems: "center" }}>
      {title && <span style={{ fontWeight: "500", marginRight: "0.5rem", color: "#666" }}>{title}:</span>}
      {items.map((item, index) => (
        <span key={index} style={{ display: "inline-flex", alignItems: "center" }}>
          {index > 0 && <span style={{ margin: "0 0.5rem", color: "#999" }}>{" > "}</span>}
          {item.onClick ? (
            <button
              onClick={item.onClick}
              style={{
                background: "none",
                border: "none",
                color: "#0070f3",
                cursor: "pointer",
                textDecoration: "underline",
                padding: 0,
                fontSize: "inherit",
              }}
            >
              {item.label}
            </button>
          ) : (
            <span style={{ color: "#333", fontWeight: index === items.length - 1 ? "500" : "normal" }}>
              {item.label}
            </span>
          )}
        </span>
      ))}
    </div>
  );
}

