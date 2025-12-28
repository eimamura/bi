"use client";

import { useState } from "react";

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  tooltip?: string;
}

export default function KPICard({ title, value, subtitle, tooltip }: KPICardProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div
      style={{
        backgroundColor: "white",
        padding: "1.5rem",
        borderRadius: "8px",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        position: "relative",
      }}
      onMouseEnter={() => tooltip && setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <div style={{ fontSize: "0.875rem", color: "#666", marginBottom: "0.5rem", display: "flex", alignItems: "center", gap: "0.25rem" }}>
        {title}
        {tooltip && (
          <span style={{ fontSize: "0.75rem", color: "#999", cursor: "help" }} title={tooltip}>
            ℹ️
          </span>
        )}
      </div>
      <div style={{ fontSize: "2rem", fontWeight: "bold", color: "#333" }}>
        {typeof value === "number" ? value.toLocaleString() : value}
      </div>
      {subtitle && <div style={{ fontSize: "0.75rem", color: "#999", marginTop: "0.25rem" }}>{subtitle}</div>}
      {showTooltip && tooltip && (
        <div
          style={{
            position: "absolute",
            bottom: "100%",
            left: "50%",
            transform: "translateX(-50%)",
            marginBottom: "0.5rem",
            padding: "0.5rem 0.75rem",
            backgroundColor: "#333",
            color: "white",
            borderRadius: "4px",
            fontSize: "0.75rem",
            whiteSpace: "nowrap",
            zIndex: 1000,
            pointerEvents: "none",
          }}
        >
          {tooltip}
        </div>
      )}
    </div>
  );
}

