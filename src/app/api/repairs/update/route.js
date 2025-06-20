export const runtime = "edge";

import { NextResponse } from "next/server";

export async function POST(request) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const { id, status, repair_summary, repair_cost } = await request.json();

  const updateData = {};
  if (status) {
    updateData.status = status;
    if (status === "collected") {
      updateData.collected_at = new Date().toISOString();
      updateData.cancelled_at = null;
    } else if (status === "cancelled") {
      updateData.cancelled_at = new Date().toISOString();
      updateData.collected_at = null;
    } else {
      updateData.collected_at = null;
      updateData.cancelled_at = null;
    }
  }
  if (repair_summary !== undefined) {
    updateData.repair_summary = repair_summary;
  }
  if (repair_cost !== undefined) {
    updateData.repair_cost = repair_cost;
  }

  const res = await fetch(
    `${supabaseUrl}/rest/v1/equipment_repairs?id=eq.${id}&select=*,clients(*)`,
    {
      method: "PATCH",
      headers: {
        apikey: supabaseAnonKey,
        Authorization: `Bearer ${supabaseAnonKey}`,
        "Content-Type": "application/json",
        Prefer: "return=representation",
      },
      body: JSON.stringify(updateData),
    }
  );

  const data = await res.json();
  if (!res.ok) {
    return NextResponse.json(
      { error: data.message || "Failed to update" },
      { status: res.status }
    );
  }
  return NextResponse.json(data);
}
