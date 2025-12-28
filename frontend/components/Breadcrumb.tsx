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
    <div style={{ fontSize: "0.875rem" }}>
      <span style={{ fontWeight: "500", marginRight: "0.5rem", color: "#666" }}>{title}:</span>
      {items.map((item, index) => (
        <span key={index}>
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
            <span style={{ color: "#333" }}>{item.label}</span>
          )}
        </span>
      ))}
    </div>
  );
}

