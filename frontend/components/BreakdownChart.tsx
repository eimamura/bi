"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Breakdown } from "../app/types";
import { formatCurrency } from "../utils/format";

interface BreakdownChartProps {
  data: Breakdown;
  onBarClick?: (label: string) => void;
}

export default function BreakdownChart({ data, onBarClick }: BreakdownChartProps) {
  // Optimize X-axis interval based on data length for better performance
  const dataLength = data.data.length;
  // Auto-adjust interval: show every Nth label based on data density
  // More aggressive interval for better readability
  const xAxisInterval = dataLength > 10 ? Math.floor(dataLength / 8) : 0;
  
  // Reduce rotation for better readability - use -30 degrees instead of -45
  const xAxisAngle = -30;
  const xAxisHeight = 70;
  const bottomMargin = 70;
  
  return (
    <div
      style={{
        backgroundColor: "white",
        padding: "1.5rem",
        borderRadius: "8px",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        overflow: "visible",
      }}
    >
      <h2 style={{ marginBottom: "1rem", fontSize: "1.25rem" }}>Breakdown</h2>
      <div style={{ width: "100%", height: "380px", overflow: "visible" }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data.data} margin={{ top: 10, right: 20, bottom: bottomMargin, left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="label"
              angle={xAxisAngle}
              textAnchor="end"
              height={xAxisHeight}
              interval={xAxisInterval}
              tick={{ fontSize: 11 }}
              dy={8}
            />
          <YAxis />
          <Tooltip 
            formatter={(value: number) => formatCurrency(value)}
            contentStyle={{ cursor: onBarClick ? "pointer" : "default" }}
            labelFormatter={(label) => onBarClick ? `Click to drill down: ${label}` : label}
          />
          <Bar
            dataKey="value"
            fill="#0070f3"
            onClick={(data) => onBarClick?.(data.label)}
            style={{ cursor: onBarClick ? "pointer" : "default" }}
            onMouseEnter={(data) => {
              if (onBarClick && data) {
                (data as any).style = { ...(data as any).style, fill: "#0051cc" };
              }
            }}
            onMouseLeave={(data) => {
              if (onBarClick && data) {
                (data as any).style = { ...(data as any).style, fill: "#0070f3" };
              }
            }}
          />
        </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

