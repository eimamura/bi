"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { TimeSeries } from "../app/types";
import { formatCurrency } from "../utils/format";

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
      <div style={{ width: "100%", height: "400px", paddingBottom: "1rem" }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data.data} margin={{ top: 5, right: 20, bottom: 100, left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="bucket"
              angle={-45}
              textAnchor="end"
              height={100}
              interval={0}
              tick={{ fontSize: 12 }}
            />
          <YAxis />
          <Tooltip formatter={(value: number) => formatCurrency(value)} />
          <Line
            type="monotone"
            dataKey="value"
            stroke="#0070f3"
            strokeWidth={2}
            dot={
              onPointClick
                ? {
                    r: 4,
                    fill: "#0070f3",
                    onClick: (_event: any, payload: any) => {
                      if (payload?.payload?.bucket) {
                        onPointClick(payload.payload.bucket);
                      }
                    },
                    style: { cursor: "pointer" },
                  }
                : { r: 4, fill: "#0070f3" }
            }
            activeDot={
              onPointClick
                ? {
                    r: 6,
                    onClick: (_event: any, payload: any) => {
                      if (payload?.payload?.bucket) {
                        onPointClick(payload.payload.bucket);
                      }
                    },
                    style: { cursor: "pointer" },
                  }
                : { r: 6 }
            }
          />
        </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

