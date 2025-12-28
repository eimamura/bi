const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function fetchKPIs(filters: {
  date_from: string;
  date_to: string;
  category?: string;
  sub_category?: string;
  sku?: string;
}) {
  const params = new URLSearchParams({
    date_from: filters.date_from,
    date_to: filters.date_to,
  });
  if (filters.category) params.append("category", filters.category);
  if (filters.sub_category) params.append("sub_category", filters.sub_category);
  if (filters.sku) params.append("sku", filters.sku);

  const res = await fetch(`${API_URL}/api/kpis?${params}`);
  if (!res.ok) throw new Error(`Failed to fetch KPIs: ${res.statusText}`);
  return res.json();
}

export async function fetchTimeSeries(filters: {
  date_from: string;
  date_to: string;
  grain: string;
  category?: string;
  sub_category?: string;
  sku?: string;
}) {
  const params = new URLSearchParams({
    date_from: filters.date_from,
    date_to: filters.date_to,
    grain: filters.grain,
  });
  if (filters.category) params.append("category", filters.category);
  if (filters.sub_category) params.append("sub_category", filters.sub_category);
  if (filters.sku) params.append("sku", filters.sku);

  const res = await fetch(`${API_URL}/api/timeseries?${params}`);
  if (!res.ok) throw new Error(`Failed to fetch time series: ${res.statusText}`);
  return res.json();
}

export async function fetchBreakdown(filters: {
  date_from: string;
  date_to: string;
  group_by: string;
  category?: string;
  sub_category?: string;
  sku?: string;
}) {
  const params = new URLSearchParams({
    date_from: filters.date_from,
    date_to: filters.date_to,
    group_by: filters.group_by,
  });
  if (filters.category) params.append("category", filters.category);
  if (filters.sub_category) params.append("sub_category", filters.sub_category);
  if (filters.sku) params.append("sku", filters.sku);

  const res = await fetch(`${API_URL}/api/breakdown?${params}`);
  if (!res.ok) throw new Error(`Failed to fetch breakdown: ${res.statusText}`);
  return res.json();
}

export async function fetchRows(filters: {
  date_from: string;
  date_to: string;
  limit: number;
  offset: number;
  order_by: string;
  order_dir: string;
  category?: string;
  sub_category?: string;
  sku?: string;
}) {
  const params = new URLSearchParams({
    date_from: filters.date_from,
    date_to: filters.date_to,
    limit: filters.limit.toString(),
    offset: filters.offset.toString(),
    order_by: filters.order_by,
    order_dir: filters.order_dir,
  });
  if (filters.category) params.append("category", filters.category);
  if (filters.sub_category) params.append("sub_category", filters.sub_category);
  if (filters.sku) params.append("sku", filters.sku);

  const res = await fetch(`${API_URL}/api/rows?${params}`);
  if (!res.ok) throw new Error(`Failed to fetch rows: ${res.statusText}`);
  return res.json();
}

export async function fetchCategories() {
  const res = await fetch(`${API_URL}/api/meta/categories`);
  if (!res.ok) throw new Error(`Failed to fetch categories: ${res.statusText}`);
  return res.json();
}

export async function fetchSubCategories(category: string) {
  const res = await fetch(`${API_URL}/api/meta/sub_categories?category=${encodeURIComponent(category)}`);
  if (!res.ok) throw new Error(`Failed to fetch sub-categories: ${res.statusText}`);
  return res.json();
}

export async function fetchSKUs(category?: string, sub_category?: string) {
  const params = new URLSearchParams();
  if (category) params.append("category", category);
  if (sub_category) params.append("sub_category", sub_category);
  const res = await fetch(`${API_URL}/api/meta/skus?${params}`);
  if (!res.ok) throw new Error(`Failed to fetch SKUs: ${res.statusText}`);
  return res.json();
}

