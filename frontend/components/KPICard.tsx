"use client";

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
}

export default function KPICard({ title, value, subtitle }: KPICardProps) {
  return (
    <div
      style={{
        backgroundColor: "white",
        padding: "1.5rem",
        borderRadius: "8px",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
      }}
    >
      <div style={{ fontSize: "0.875rem", color: "#666", marginBottom: "0.5rem" }}>{title}</div>
      <div style={{ fontSize: "2rem", fontWeight: "bold", color: "#333" }}>
        {typeof value === "number" ? value.toLocaleString() : value}
      </div>
      {subtitle && <div style={{ fontSize: "0.75rem", color: "#999", marginTop: "0.25rem" }}>{subtitle}</div>}
    </div>
  );
}

