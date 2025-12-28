"use client";

import { TableRow, TableResponse, SortDirection } from "../app/types";
import { useState, useEffect } from "react";
import { fetchRows } from "../app/api";
import { formatCurrency, formatNumber } from "../utils/format";

interface DataTableProps {
  filters: {
    date_from: string;
    date_to: string;
    category?: string;
    sub_category?: string;
  };
}

type SortColumn = "date" | "category" | "sub_category" | "amount" | "quantity";

export default function DataTable({ filters }: DataTableProps) {
  const [data, setData] = useState<TableRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [pageSize] = useState(50);
  const [orderBy, setOrderBy] = useState<SortColumn>("date");
  const [orderDir, setOrderDir] = useState<SortDirection>("desc");

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const response: TableResponse = await fetchRows({
          ...filters,
          limit: pageSize,
          offset: page * pageSize,
          order_by: orderBy,
          order_dir: orderDir,
        });
        setData(response.data);
        setTotal(response.total);
      } catch (error) {
        console.error("Failed to load table data:", error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [filters, page, pageSize, orderBy, orderDir]);

  const handleSort = (column: SortColumn) => {
    if (orderBy === column) {
      setOrderDir(orderDir === "asc" ? "desc" : "asc");
    } else {
      setOrderBy(column);
      setOrderDir("asc");
    }
  };

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div>
      {loading ? (
        <div style={{ padding: "2rem", textAlign: "center" }}>Loading...</div>
      ) : (
        <>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "2px solid #ddd" }}>
                  <th
                    onClick={() => handleSort("date")}
                    style={{
                      padding: "0.75rem",
                      textAlign: "left",
                      cursor: "pointer",
                      userSelect: "none",
                      backgroundColor: orderBy === "date" ? "#f0f0f0" : "transparent",
                    }}
                  >
                    Date {orderBy === "date" && (orderDir === "asc" ? "↑" : "↓")}
                  </th>
                  <th
                    onClick={() => handleSort("category")}
                    style={{
                      padding: "0.75rem",
                      textAlign: "left",
                      cursor: "pointer",
                      userSelect: "none",
                      backgroundColor: orderBy === "category" ? "#f0f0f0" : "transparent",
                    }}
                  >
                    Category {orderBy === "category" && (orderDir === "asc" ? "↑" : "↓")}
                  </th>
                  <th
                    onClick={() => handleSort("sub_category")}
                    style={{
                      padding: "0.75rem",
                      textAlign: "left",
                      cursor: "pointer",
                      userSelect: "none",
                      backgroundColor: orderBy === "sub_category" ? "#f0f0f0" : "transparent",
                    }}
                  >
                    Sub-Category {orderBy === "sub_category" && (orderDir === "asc" ? "↑" : "↓")}
                  </th>
                  <th
                    onClick={() => handleSort("amount")}
                    style={{
                      padding: "0.75rem",
                      textAlign: "right",
                      cursor: "pointer",
                      userSelect: "none",
                      backgroundColor: orderBy === "amount" ? "#f0f0f0" : "transparent",
                    }}
                  >
                    Amount {orderBy === "amount" && (orderDir === "asc" ? "↑" : "↓")}
                  </th>
                  <th
                    onClick={() => handleSort("quantity")}
                    style={{
                      padding: "0.75rem",
                      textAlign: "right",
                      cursor: "pointer",
                      userSelect: "none",
                      backgroundColor: orderBy === "quantity" ? "#f0f0f0" : "transparent",
                    }}
                  >
                    Quantity {orderBy === "quantity" && (orderDir === "asc" ? "↑" : "↓")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.map((row) => (
                  <tr key={row.id} style={{ borderBottom: "1px solid #eee" }}>
                    <td style={{ padding: "0.75rem" }}>{row.date}</td>
                    <td style={{ padding: "0.75rem" }}>{row.category}</td>
                    <td style={{ padding: "0.75rem" }}>{row.sub_category}</td>
                    <td style={{ padding: "0.75rem", textAlign: "right" }}>
                      {formatCurrency(row.amount)}
                    </td>
                    <td style={{ padding: "0.75rem", textAlign: "right" }}>
                      {formatNumber(row.quantity)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ marginTop: "1rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ fontSize: "0.875rem", color: "#666" }}>
              Showing {page * pageSize + 1} to {Math.min((page + 1) * pageSize, total)} of {total} rows
            </div>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <button
                onClick={() => setPage(0)}
                disabled={page === 0}
                style={{
                  padding: "0.5rem 1rem",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                  cursor: page === 0 ? "not-allowed" : "pointer",
                  opacity: page === 0 ? 0.5 : 1,
                }}
              >
                First
              </button>
              <button
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                style={{
                  padding: "0.5rem 1rem",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                  cursor: page === 0 ? "not-allowed" : "pointer",
                  opacity: page === 0 ? 0.5 : 1,
                }}
              >
                Previous
              </button>
              <span style={{ padding: "0.5rem 1rem" }}>
                Page {page + 1} of {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
                style={{
                  padding: "0.5rem 1rem",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                  cursor: page >= totalPages - 1 ? "not-allowed" : "pointer",
                  opacity: page >= totalPages - 1 ? 0.5 : 1,
                }}
              >
                Next
              </button>
              <button
                onClick={() => setPage(totalPages - 1)}
                disabled={page >= totalPages - 1}
                style={{
                  padding: "0.5rem 1rem",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                  cursor: page >= totalPages - 1 ? "not-allowed" : "pointer",
                  opacity: page >= totalPages - 1 ? 0.5 : 1,
                }}
              >
                Last
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

