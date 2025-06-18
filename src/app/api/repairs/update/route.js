export const runtime = "edge";

import { NextResponse } from "next/server";

export async function POST(request) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const { id, status } = await request.json();

  const res = await fetch(
    `${supabaseUrl}/rest/v1/equipment_repairs?id=eq.${id}`,
    {
      method: "PATCH",
      headers: {
        apikey: supabaseAnonKey,
        Authorization: `Bearer ${supabaseAnonKey}`,
        "Content-Type": "application/json",
        Prefer: "return=representation",
      },
      body: JSON.stringify({ status }),
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
