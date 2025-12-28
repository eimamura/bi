export interface KPIs {
  total_amount: number;
  total_quantity: number;
  avg_amount_per_day: number;
  avg_amount_per_tx?: number;
  max_daily_amount?: number;
}

export interface TimeSeriesPoint {
  bucket: string;
  value: number;
}

export interface TimeSeries {
  data: TimeSeriesPoint[];
}

export interface BreakdownPoint {
  label: string;
  value: number;
}

export interface Breakdown {
  data: BreakdownPoint[];
}

export interface TableRow {
  id: string;
  date: string;
  category: string;
  sub_category: string;
  amount: number;
  quantity: number;
}

export interface TableResponse {
  data: TableRow[];
  total: number;
  limit: number;
  offset: number;
}

export interface Categories {
  categories: string[];
}

export interface SubCategories {
  sub_categories: string[];
}

export type TimeGrain = "month" | "week" | "day";
export type BreakdownLevel = "category" | "sub_category";
export type SortDirection = "asc" | "desc";

export interface Filters {
  date_from: string;
  date_to: string;
  category?: string;
  sub_category?: string;
}

export interface DrillState {
  time_grain: TimeGrain;
  selected_time_bucket?: string;
  breakdown_level: BreakdownLevel;
  selected_category?: string;
}

