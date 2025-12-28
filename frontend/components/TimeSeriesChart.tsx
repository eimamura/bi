"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { TimeSeries } from "../app/types";
import { formatCurrency } from "../utils/format";

interface TimeSeriesChartProps {
  data: TimeSeries;
  onPointClick?: (bucket: string) => void;
  timeGrain?: "month" | "week" | "day";
}

// Format month labels: "2025-09" -> "Sep", "2025-10" -> "Oct", etc.
function formatMonthLabel(label: string): string {
  const monthMap: { [key: string]: string } = {
    "01": "Jan", "02": "Feb", "03": "Mar", "04": "Apr",
    "05": "May", "06": "Jun", "07": "Jul", "08": "Aug",
    "09": "Sep", "10": "Oct", "11": "Nov", "12": "Dec",
  };
  
  // Check if it's a month format (YYYY-MM)
  if (/^\d{4}-\d{2}$/.test(label)) {
    const month = label.split("-")[1];
    return monthMap[month] || label;
  }
  
  return label;
}

export default function TimeSeriesChart({ data, onPointClick, timeGrain = "month" }: TimeSeriesChartProps) {
  // Optimize X-axis interval based on data length for better performance
  const dataLength = data.data.length;
  // Auto-adjust interval: show every Nth label based on data density
  // More aggressive interval for better readability
  const xAxisInterval = dataLength > 15 ? Math.floor(dataLength / 12) : 0;
  
  // For month view, use shorter labels and reduce rotation
  const isMonthView = timeGrain === "month";
  const isWeekView = timeGrain === "week";
  
  // Reduce rotation angles for better readability
  const xAxisAngle = isMonthView ? 0 : isWeekView ? -30 : -30;
  const xAxisHeight = isMonthView ? 50 : isWeekView ? 70 : 80;
  const bottomMargin = isMonthView ? 50 : isWeekView ? 70 : 80;
  
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
      <h2 style={{ marginBottom: "1rem", fontSize: "1.25rem" }}>Time Series</h2>
      <div style={{ width: "100%", height: "380px", overflow: "visible" }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data.data} margin={{ top: 10, right: 20, bottom: bottomMargin, left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="bucket"
              angle={xAxisAngle}
              textAnchor={isMonthView ? "middle" : "end"}
              height={xAxisHeight}
              interval={xAxisInterval}
              tick={{ fontSize: 11 }}
              tickFormatter={isMonthView ? formatMonthLabel : undefined}
              dy={isMonthView ? 5 : 8}
            />
          <YAxis />
          <Tooltip 
            formatter={(value: number) => formatCurrency(value)}
            contentStyle={{ cursor: onPointClick ? "pointer" : "default" }}
            labelFormatter={(label) => onPointClick ? `Click to drill down: ${label}` : label}
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke="#0070f3"
            strokeWidth={2}
            dot={
              onPointClick
                ? {
                    r: 5,
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
                    r: 8,
                    fill: "#0051cc",
                    stroke: "#0070f3",
                    strokeWidth: 2,
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

