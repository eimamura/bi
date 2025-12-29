"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import FilterPanel from "../../components/FilterPanel";
import KPICard from "../../components/KPICard";
import TimeSeriesChart from "../../components/TimeSeriesChart";
import BreakdownChart from "../../components/BreakdownChart";
import DataTable from "../../components/DataTable";
import Breadcrumb from "../../components/Breadcrumb";
import { Filters, KPIs, TimeSeries, Breakdown, DrillState, TimeGrain, BreakdownLevel } from "../types";
import { fetchKPIs, fetchTimeSeries, fetchBreakdown } from "../api";
import { formatCurrency, formatNumber } from "../../utils/format";

// Debounce utility function
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export default function Dashboard() {
  // Calculate default date range (last 90 days)
  const today = new Date();
  const ninetyDaysAgo = new Date(today);
  ninetyDaysAgo.setDate(today.getDate() - 90);

  const [filters, setFilters] = useState<Filters>({
    date_from: ninetyDaysAgo.toISOString().split("T")[0],
    date_to: today.toISOString().split("T")[0],
  });

  const [drillState, setDrillState] = useState<DrillState>({
    time_grain: "month",
    breakdown_level: "category",
  });

  const [kpis, setKpis] = useState<KPIs | null>(null);
  const [timeSeries, setTimeSeries] = useState<TimeSeries | null>(null);
  const [breakdown, setBreakdown] = useState<Breakdown | null>(null);
  const [loading, setLoading] = useState(true);
  const [filtersExpanded, setFiltersExpanded] = useState(true);
  const [tableExpanded, setTableExpanded] = useState(false);

  // Debounce only date filters (500ms delay) to reduce API calls
  // Category/sub-category changes apply immediately
  const debouncedDateFrom = useDebounce(filters.date_from, 500);
  const debouncedDateTo = useDebounce(filters.date_to, 500);
  
  // Combine debounced date filters with immediate category filters
  // Use individual values to prevent object reference changes
  const effectiveFilters = useMemo(
    () => ({
      date_from: debouncedDateFrom,
      date_to: debouncedDateTo,
      category: filters.category,
      sub_category: filters.sub_category,
      sku: filters.sku,
    }),
    [debouncedDateFrom, debouncedDateTo, filters.category, filters.sub_category, filters.sku]
  );
  
  // Memoize filter key to prevent unnecessary re-renders
  const filterKey = useMemo(
    () => `${effectiveFilters.date_from}-${effectiveFilters.date_to}-${effectiveFilters.category || ""}-${effectiveFilters.sub_category || ""}-${effectiveFilters.sku || ""}`,
    [effectiveFilters.date_from, effectiveFilters.date_to, effectiveFilters.category, effectiveFilters.sub_category, effectiveFilters.sku]
  );

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [kpisData, timeSeriesData, breakdownData] = await Promise.all([
          fetchKPIs(effectiveFilters),
          fetchTimeSeries({
            ...effectiveFilters,
            grain: drillState.time_grain,
          }),
          fetchBreakdown({
            ...effectiveFilters,
            group_by: drillState.breakdown_level,
          }),
        ]);

        setKpis(kpisData);
        setTimeSeries(timeSeriesData);
        setBreakdown(breakdownData);
      } catch (error) {
        console.error("Failed to load dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterKey, drillState.time_grain, drillState.breakdown_level]);

  const handleRefresh = useCallback(() => {
    setLoading(true);
    Promise.all([
      fetchKPIs(filters),
      fetchTimeSeries({
        ...filters,
        grain: drillState.time_grain,
      }),
      fetchBreakdown({
        ...filters,
        group_by: drillState.breakdown_level,
      }),
    ])
      .then(([kpisData, timeSeriesData, breakdownData]) => {
        setKpis(kpisData);
        setTimeSeries(timeSeriesData);
        setBreakdown(breakdownData);
      })
      .catch((error) => {
        console.error("Failed to load dashboard data:", error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [filters, drillState.time_grain, drillState.breakdown_level]);

  const handleFiltersChange = useCallback((newFilters: Filters) => {
    setFilters(newFilters);
    // Sync drill state with filter changes
    setDrillState((prevState) => {
      if (newFilters.sub_category) {
        return {
          ...prevState,
          breakdown_level: "sub_category",
          selected_category: newFilters.category,
        };
      } else if (newFilters.category) {
        return {
          ...prevState,
          breakdown_level: "category",
          selected_category: undefined,
        };
      } else {
        return {
          ...prevState,
          breakdown_level: "category",
          selected_category: undefined,
        };
      }
    });
  }, []);

  // Time drilldown handlers
  const handleTimeDrilldown = (bucket: string) => {
    const currentGrain = drillState.time_grain;
    let nextGrain: TimeGrain;
    let dateFrom: string;
    let dateTo: string;

    if (currentGrain === "month") {
      // Drill from month to week
      nextGrain = "week";
      // Parse YYYY-MM format and get first/last day of month
      const [year, month] = bucket.split("-").map(Number);
      dateFrom = new Date(year, month - 1, 1).toISOString().split("T")[0];
      dateTo = new Date(year, month, 0).toISOString().split("T")[0];
    } else if (currentGrain === "week") {
      // Drill from week to day
      nextGrain = "day";
      // Bucket is YYYY-MM-DD (start of week from date_trunc)
      const weekStart = new Date(bucket + "T00:00:00");
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      dateFrom = weekStart.toISOString().split("T")[0];
      dateTo = weekEnd.toISOString().split("T")[0];
    } else {
      // Already at day level, no further drilldown
      return;
    }

    setDrillState({
      ...drillState,
      time_grain: nextGrain,
      selected_time_bucket: bucket,
    });

    // Update filters to focus on the selected time bucket
    setFilters({
      ...filters,
      date_from: dateFrom,
      date_to: dateTo,
    });
  };

  const handleTimeRollup = () => {
    const currentGrain = drillState.time_grain;
    let prevGrain: TimeGrain;

    if (currentGrain === "day") {
      prevGrain = "week";
    } else if (currentGrain === "week") {
      prevGrain = "month";
    } else {
      return; // Already at top level
    }

    setDrillState({
      ...drillState,
      time_grain: prevGrain,
      selected_time_bucket: undefined,
    });

    // Restore original date range (use default 90 days)
    const today = new Date();
    const ninetyDaysAgo = new Date(today);
    ninetyDaysAgo.setDate(today.getDate() - 90);
    setFilters({
      ...filters,
      date_from: ninetyDaysAgo.toISOString().split("T")[0],
      date_to: today.toISOString().split("T")[0],
    });
  };

  // Category drilldown handlers
  const handleCategoryDrilldown = (label: string) => {
    if (drillState.breakdown_level === "category") {
      // Drill from category to sub_category
      setDrillState({
        ...drillState,
        breakdown_level: "sub_category",
        selected_category: label,
      });
      // Update filters to focus on the selected category
      setFilters({
        ...filters,
        category: label,
        sub_category: undefined, // Clear sub_category when drilling down
      });
    }
  };

  const handleCategoryRollup = () => {
    if (drillState.breakdown_level === "sub_category") {
      setDrillState({
        ...drillState,
        breakdown_level: "category",
        selected_category: undefined,
      });
      // Clear category filter but keep other filters
      setFilters({
        ...filters,
        category: undefined,
        sub_category: undefined,
      });
    }
  };

  // Build breadcrumb items - sync with filters and drill state
  const getTimeBreadcrumbItems = () => {
    const items = [];
    items.push({
      label: drillState.time_grain === "month" ? "Month" : drillState.time_grain === "week" ? "Week" : "Day",
      onClick: drillState.time_grain !== "month" ? handleTimeRollup : undefined,
    });

    if (drillState.time_grain === "week" || drillState.time_grain === "day") {
      items.push({
        label: drillState.selected_time_bucket ? `Week(${drillState.selected_time_bucket})` : "Week",
        onClick: drillState.time_grain === "day" ? handleTimeRollup : undefined,
      });
    }

    if (drillState.time_grain === "day") {
      items.push({
        label: drillState.selected_time_bucket || "Day",
      });
    }

    return items;
  };

  const getCategoryBreadcrumbItems = () => {
    const items = [];
    
    // Build drill path: All > Category > Sub-Category
    if (filters.category) {
      // Category is selected (via filter or drill)
      items.push({
        label: filters.category,
        onClick: () => {
          // Clicking category rolls up to All
          setFilters({ ...filters, category: undefined, sub_category: undefined });
          setDrillState({
            ...drillState,
            breakdown_level: "category",
            selected_category: undefined,
          });
        },
      });
      
      if (filters.sub_category) {
        // Sub-category is selected
        items.push({
          label: filters.sub_category,
          onClick: () => {
            // Clicking sub-category rolls up to category level
            setFilters({ ...filters, sub_category: undefined });
            setDrillState({
              ...drillState,
              breakdown_level: "category",
            });
          },
        });
      } else if (drillState.breakdown_level === "sub_category" && drillState.selected_category === filters.category) {
        // Drilled down to sub-categories view (no specific sub-category selected yet)
        items.push({
          label: "Sub-Categories",
        });
      }
    } else {
      // No category selected - show "All"
      items.push({
        label: "All",
        onClick: drillState.breakdown_level !== "category" ? handleCategoryRollup : undefined,
      });

      if (drillState.breakdown_level === "sub_category" && drillState.selected_category) {
        // Drilled down but no filter applied
        items.push({
          label: drillState.selected_category,
          onClick: handleCategoryRollup,
        });
      }
    }

    return items;
  };

  return (
    <div style={{ padding: "2rem", maxWidth: "1400px", margin: "0 auto" }}>
      <h1 style={{ marginBottom: "1.5rem", fontSize: "2rem", fontWeight: "600" }}>BI Dashboard</h1>

      {/* Compact Filters */}
      <div
        style={{
          backgroundColor: "white",
          borderRadius: "8px",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          marginBottom: "1.5rem",
        }}
      >
        <div
          style={{
            padding: "1rem",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <button
            onClick={() => setFiltersExpanded(!filtersExpanded)}
            style={{
              border: "none",
              background: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              fontSize: "1rem",
              fontWeight: "500",
              padding: 0,
            }}
          >
            <span>Filters</span>
            <span style={{ fontSize: "0.875rem", color: "#666" }}>
              {filtersExpanded ? "▲" : "▼"}
            </span>
          </button>
          <div style={{ fontSize: "0.875rem", color: "#666", flex: 1, textAlign: "right", marginLeft: "1rem" }}>
            Date: {filters.date_from} → {filters.date_to} | Category: {filters.category || "All"} | Sub: {filters.sub_category || "All"} | SKU: {filters.sku || "All"}
          </div>
        </div>
        {filtersExpanded && (
          <div style={{ padding: "0 1rem 1rem 1rem", borderTop: "1px solid #eee" }}>
            <FilterPanel
              filters={filters}
              onFiltersChange={handleFiltersChange}
              onRefresh={handleRefresh}
            />
          </div>
        )}
      </div>

      {loading ? (
        <div style={{ padding: "2rem", textAlign: "center" }}>Loading dashboard data...</div>
      ) : (
        <>
          {/* KPI Cards */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
              gap: "1rem",
              marginBottom: "1.5rem",
            }}
          >
            {kpis && (
              <>
                <KPICard title="Total Amount" value={formatCurrency(kpis.total_amount)} />
                <KPICard title="Total Quantity" value={formatNumber(kpis.total_quantity)} />
                <KPICard title="Avg Amount/Day" value={formatCurrency(kpis.avg_amount_per_day)} />
                {kpis.avg_amount_per_tx && (
                  <KPICard 
                    title="Avg Amount/Tx" 
                    value={formatCurrency(kpis.avg_amount_per_tx)}
                    tooltip="Tx = Transaction. Average amount per transaction."
                  />
                )}
                {kpis.max_daily_amount && (
                  <KPICard 
                    title="Max Daily Amount" 
                    value={formatCurrency(kpis.max_daily_amount)}
                    tooltip={`Max Daily Amount: Maximum daily total amount within the selected date range (${drillState.time_grain} granularity)`}
                  />
                )}
              </>
            )}
          </div>

          {/* Drill Navigation + Time Grain - Above Charts */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "1rem",
              padding: "0.75rem",
              backgroundColor: "#f8f9fa",
              borderRadius: "6px",
              fontSize: "0.875rem",
            }}
          >
            <div style={{ display: "flex", gap: "1rem", alignItems: "center", flexWrap: "wrap" }}>
              {/* Time Grain Selector */}
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <span style={{ fontWeight: "500", color: "#666" }}>Time:</span>
                <select
                  value={drillState.time_grain}
                  onChange={(e) => {
                    const newGrain = e.target.value as TimeGrain;
                    setDrillState({
                      ...drillState,
                      time_grain: newGrain,
                      selected_time_bucket: undefined,
                    });
                  }}
                  style={{
                    padding: "0.25rem 0.5rem",
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                    fontSize: "0.875rem",
                    cursor: "pointer",
                  }}
                >
                  <option value="month">Month</option>
                  <option value="week">Week</option>
                  <option value="day">Day</option>
                </select>
              </div>

              {/* Drill Breadcrumb */}
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <span style={{ fontWeight: "500", color: "#666" }}>Drill:</span>
                <Breadcrumb title="" items={getCategoryBreadcrumbItems()} />
                {(drillState.time_grain === "day" && drillState.breakdown_level === "sub_category") && (
                  <span style={{ fontSize: "0.75rem", color: "#999", fontStyle: "italic" }}>
                    (Cannot drill further)
                  </span>
                )}
              </div>
            </div>

            {/* Reset/Back Buttons */}
            {(drillState.time_grain !== "month" || drillState.breakdown_level !== "category" || filters.category || filters.sub_category) && (
              <div style={{ display: "flex", gap: "0.5rem" }}>
                {(drillState.time_grain !== "month" || drillState.breakdown_level !== "category") && (
                  <button
                    onClick={() => {
                      setDrillState({
                        time_grain: "month",
                        breakdown_level: "category",
                        selected_time_bucket: undefined,
                        selected_category: undefined,
                      });
                      setFilters({
                        ...filters,
                        category: undefined,
                        sub_category: undefined,
                      });
                    }}
                    style={{
                      padding: "0.25rem 0.75rem",
                      backgroundColor: "#666",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer",
                      fontSize: "0.75rem",
                    }}
                  >
                    Reset Drill
                  </button>
                )}
                {drillState.time_grain !== "month" && (
                  <button
                    onClick={handleTimeRollup}
                    style={{
                      padding: "0.25rem 0.75rem",
                      backgroundColor: "#0070f3",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer",
                      fontSize: "0.75rem",
                    }}
                  >
                    Back
                  </button>
                )}
                {drillState.breakdown_level === "sub_category" && (
                  <button
                    onClick={handleCategoryRollup}
                    style={{
                      padding: "0.25rem 0.75rem",
                      backgroundColor: "#0070f3",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer",
                      fontSize: "0.75rem",
                    }}
                  >
                    Back
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Charts */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(450px, 1fr))",
              gap: "1.5rem",
              marginBottom: "1.5rem",
              overflow: "visible",
            }}
          >
            {timeSeries && (
              <TimeSeriesChart
                data={timeSeries}
                onPointClick={
                  drillState.time_grain !== "day" ? handleTimeDrilldown : undefined
                }
                timeGrain={drillState.time_grain}
              />
            )}
            {breakdown && (
              <BreakdownChart
                data={breakdown}
                onBarClick={
                  drillState.breakdown_level === "category" ? handleCategoryDrilldown : undefined
                }
              />
            )}
          </div>

          {/* Collapsible Data Table */}
          <div
            style={{
              backgroundColor: "white",
              borderRadius: "8px",
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            }}
          >
            <button
              onClick={() => setTableExpanded(!tableExpanded)}
              style={{
                width: "100%",
                padding: "1rem 1.5rem",
                border: "none",
                background: "none",
                cursor: "pointer",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                fontSize: "1.25rem",
                fontWeight: "500",
                borderBottom: tableExpanded ? "1px solid #eee" : "none",
              }}
            >
              <span>Data Table</span>
              <span style={{ fontSize: "0.875rem", color: "#666" }}>
                {tableExpanded ? "▲ Collapse" : "▼ Expand"}
              </span>
            </button>
            {tableExpanded && (
              <div style={{ padding: "0 1.5rem 1.5rem 1.5rem" }}>
                <DataTable filters={effectiveFilters} />
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
