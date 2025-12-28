"use client";

import { Filters, DrillState } from "../app/types";

interface StatusChipsProps {
  filters: Filters;
  drillState: DrillState;
}

export default function StatusChips({ filters, drillState }: StatusChipsProps) {
  const timeGrainLabel = drillState.time_grain === "month" ? "Month" : drillState.time_grain === "week" ? "Week" : "Day";
  
  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "0.5rem",
        marginBottom: "1rem",
        padding: "0.75rem",
        backgroundColor: "#f8f9fa",
        borderRadius: "6px",
      }}
    >
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          padding: "0.25rem 0.75rem",
          backgroundColor: "#e3f2fd",
          color: "#1976d2",
          borderRadius: "16px",
          fontSize: "0.875rem",
          fontWeight: "500",
        }}
      >
        Date: {filters.date_from} → {filters.date_to}
      </div>
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          padding: "0.25rem 0.75rem",
          backgroundColor: "#e8f5e9",
          color: "#2e7d32",
          borderRadius: "16px",
          fontSize: "0.875rem",
          fontWeight: "500",
        }}
      >
        Category: {filters.category || "All"}
      </div>
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          padding: "0.25rem 0.75rem",
          backgroundColor: "#fff3e0",
          color: "#e65100",
          borderRadius: "16px",
          fontSize: "0.875rem",
          fontWeight: "500",
        }}
      >
        Sub: {filters.sub_category || "All"}
      </div>
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          padding: "0.25rem 0.75rem",
          backgroundColor: "#f3e5f5",
          color: "#7b1fa2",
          borderRadius: "16px",
          fontSize: "0.875rem",
          fontWeight: "500",
        }}
      >
        Time: {timeGrainLabel}
      </div>
    </div>
  );
}

