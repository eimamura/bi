"use client";

import { useState, useEffect } from "react";
import FilterPanel from "../../components/FilterPanel";
import KPICard from "../../components/KPICard";
import TimeSeriesChart from "../../components/TimeSeriesChart";
import BreakdownChart from "../../components/BreakdownChart";
import DataTable from "../../components/DataTable";
import Breadcrumb from "../../components/Breadcrumb";
import { Filters, KPIs, TimeSeries, Breakdown, DrillState, TimeGrain, BreakdownLevel } from "../types";
import { fetchKPIs, fetchTimeSeries, fetchBreakdown } from "../api";

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

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [kpisData, timeSeriesData, breakdownData] = await Promise.all([
          fetchKPIs(filters),
          fetchTimeSeries({
            ...filters,
            grain: drillState.time_grain,
          }),
          fetchBreakdown({
            ...filters,
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
  }, [filters, drillState]);

  const handleRefresh = () => {
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
  };

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

  // Build breadcrumb items
  const getTimeBreadcrumbItems = () => {
    const items = [];
    items.push({
      label: "Month",
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
    items.push({
      label: "All",
      onClick: drillState.breakdown_level !== "category" ? handleCategoryRollup : undefined,
    });

    if (drillState.breakdown_level === "sub_category" && drillState.selected_category) {
      items.push({
        label: drillState.selected_category,
      });
    }

    return items;
  };

  return (
    <div style={{ padding: "2rem", maxWidth: "1400px", margin: "0 auto" }}>
      <h1 style={{ marginBottom: "2rem", fontSize: "2rem" }}>BI Dashboard</h1>

      <FilterPanel filters={filters} onFiltersChange={setFilters} onRefresh={handleRefresh} />

      {loading ? (
        <div style={{ padding: "2rem", textAlign: "center" }}>Loading dashboard data...</div>
      ) : (
        <>
          {/* KPI Cards */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "1rem",
              marginBottom: "1.5rem",
            }}
          >
            {kpis && (
              <>
                <KPICard
                  title="Total Amount"
                  value={`$${kpis.total_amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                />
                <KPICard title="Total Quantity" value={kpis.total_quantity.toLocaleString()} />
                <KPICard
                  title="Avg Amount/Day"
                  value={`$${kpis.avg_amount_per_day.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                />
                {kpis.avg_amount_per_tx && (
                  <KPICard
                    title="Avg Amount/Tx"
                    value={`$${kpis.avg_amount_per_tx.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                  />
                )}
                {kpis.max_daily_amount && (
                  <KPICard
                    title="Max Daily Amount"
                    value={`$${kpis.max_daily_amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                  />
                )}
              </>
            )}
          </div>

          {/* Breadcrumbs */}
          <div
            style={{
              backgroundColor: "white",
              padding: "1rem",
              borderRadius: "8px",
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
              marginBottom: "1.5rem",
            }}
          >
            <Breadcrumb title="Time" items={getTimeBreadcrumbItems()} />
            <Breadcrumb title="Category" items={getCategoryBreadcrumbItems()} />
          </div>

          {/* Charts */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(500px, 1fr))",
              gap: "1.5rem",
              marginBottom: "1.5rem",
            }}
          >
            {timeSeries && (
              <TimeSeriesChart
                data={timeSeries}
                onPointClick={
                  drillState.time_grain !== "day" ? handleTimeDrilldown : undefined
                }
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

          {/* Data Table */}
          <DataTable filters={filters} />
        </>
      )}
    </div>
  );
}
