"use client";

import { useState, useEffect } from "react";
import FilterPanel from "../../components/FilterPanel";
import KPICard from "../../components/KPICard";
import TimeSeriesChart from "../../components/TimeSeriesChart";
import BreakdownChart from "../../components/BreakdownChart";
import DataTable from "../../components/DataTable";
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

          {/* Charts */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(500px, 1fr))",
              gap: "1.5rem",
              marginBottom: "1.5rem",
            }}
          >
            {timeSeries && <TimeSeriesChart data={timeSeries} />}
            {breakdown && <BreakdownChart data={breakdown} />}
          </div>

          {/* Data Table */}
          <DataTable filters={filters} />
        </>
      )}
    </div>
  );
}
