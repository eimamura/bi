"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Breakdown } from "../app/types";
import { formatCurrency } from "../utils/format";

interface BreakdownChartProps {
  data: Breakdown;
  onBarClick?: (label: string) => void;
}

export default function BreakdownChart({ data, onBarClick }: BreakdownChartProps) {
  return (
    <div
      style={{
        backgroundColor: "white",
        padding: "1.5rem",
        borderRadius: "8px",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
      }}
    >
      <h2 style={{ marginBottom: "1rem", fontSize: "1.25rem" }}>Breakdown</h2>
      <div style={{ width: "100%", height: "400px", paddingBottom: "1rem" }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data.data} margin={{ top: 5, right: 20, bottom: 100, left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="label"
              angle={-45}
              textAnchor="end"
              height={100}
              interval={0}
              tick={{ fontSize: 12 }}
            />
          <YAxis />
          <Tooltip formatter={(value: number) => formatCurrency(value)} />
          <Bar
            dataKey="value"
            fill="#0070f3"
            onClick={(data) => onBarClick?.(data.label)}
            style={{ cursor: onBarClick ? "pointer" : "default" }}
          />
        </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

