"use client";

import { Filters, Categories, SubCategories } from "../app/types";
import { useState, useEffect } from "react";
import { fetchCategories, fetchSubCategories } from "../app/api";

interface FilterPanelProps {
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
  onRefresh: () => void;
}

export default function FilterPanel({ filters, onFiltersChange, onRefresh }: FilterPanelProps) {
  const [categories, setCategories] = useState<string[]>([]);
  const [subCategories, setSubCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCategories() {
      try {
        const data: Categories = await fetchCategories();
        setCategories(data.categories);
      } catch (error) {
        console.error("Failed to load categories:", error);
      } finally {
        setLoading(false);
      }
    }
    loadCategories();
  }, []);

  useEffect(() => {
    async function loadSubCategories() {
      if (filters.category) {
        try {
          const data: SubCategories = await fetchSubCategories(filters.category);
          setSubCategories(data.sub_categories);
          // Clear sub_category if it's not valid for the new category
          // Only update if sub_category exists and is invalid to prevent infinite loop
          if (filters.sub_category && !data.sub_categories.includes(filters.sub_category)) {
            onFiltersChange({ ...filters, sub_category: undefined });
          }
        } catch (error) {
          console.error("Failed to load sub-categories:", error);
          setSubCategories([]);
        }
      } else {
        setSubCategories([]);
      }
    }
    loadSubCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.category]);

  const handleFilterChange = (key: keyof Filters, value: string | undefined) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const handleClear = () => {
    onFiltersChange({
      date_from: filters.date_from,
      date_to: filters.date_to,
    });
  };

  return (
    <div style={{ paddingTop: "1rem" }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem" }}>
        <div>
          <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.875rem", fontWeight: "500" }}>
            Date From *
          </label>
          <input
            type="date"
            value={filters.date_from}
            onChange={(e) => handleFilterChange("date_from", e.target.value)}
            style={{
              width: "100%",
              padding: "0.5rem",
              border: "1px solid #ddd",
              borderRadius: "4px",
            }}
          />
        </div>
        <div>
          <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.875rem", fontWeight: "500" }}>
            Date To *
          </label>
          <input
            type="date"
            value={filters.date_to}
            onChange={(e) => handleFilterChange("date_to", e.target.value)}
            style={{
              width: "100%",
              padding: "0.5rem",
              border: "1px solid #ddd",
              borderRadius: "4px",
            }}
          />
        </div>
        <div>
          <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.875rem", fontWeight: "500" }}>
            Category
          </label>
          <select
            value={filters.category || ""}
            onChange={(e) => handleFilterChange("category", e.target.value || undefined)}
            disabled={loading}
            style={{
              width: "100%",
              padding: "0.5rem",
              border: "1px solid #ddd",
              borderRadius: "4px",
            }}
          >
            <option value="">All</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.875rem", fontWeight: "500" }}>
            Sub-Category
          </label>
          <select
            value={filters.sub_category || ""}
            onChange={(e) => handleFilterChange("sub_category", e.target.value || undefined)}
            disabled={!filters.category || loading}
            style={{
              width: "100%",
              padding: "0.5rem",
              border: "1px solid #ddd",
              borderRadius: "4px",
            }}
          >
            <option value="">All</option>
            {subCategories.map((sub) => (
              <option key={sub} value={sub}>
                {sub}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div style={{ marginTop: "1rem", display: "flex", gap: "0.5rem" }}>
        <button
          onClick={onRefresh}
          style={{
            padding: "0.5rem 1rem",
            backgroundColor: "#0070f3",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Refresh
        </button>
        <button
          onClick={handleClear}
          style={{
            padding: "0.5rem 1rem",
            backgroundColor: "#666",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Clear Filters
        </button>
      </div>
    </div>
  );
}

