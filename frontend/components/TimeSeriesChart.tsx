"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { TimeSeries } from "../app/types";

interface TimeSeriesChartProps {
  data: TimeSeries;
  onPointClick?: (bucket: string) => void;
}

export default function TimeSeriesChart({ data, onPointClick }: TimeSeriesChartProps) {
  return (
    <div
      style={{
        backgroundColor: "white",
        padding: "1.5rem",
        borderRadius: "8px",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
      }}
    >
      <h2 style={{ marginBottom: "1rem", fontSize: "1.25rem" }}>Time Series</h2>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data.data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="bucket" angle={-45} textAnchor="end" height={80} />
          <YAxis />
          <Tooltip formatter={(value: number) => value.toLocaleString()} />
          <Line
            type="monotone"
            dataKey="value"
            stroke="#0070f3"
            strokeWidth={2}
            dot={{ r: 4 }}
            onClick={(data) => onPointClick?.(data.bucket)}
            style={{ cursor: onPointClick ? "pointer" : "default" }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

