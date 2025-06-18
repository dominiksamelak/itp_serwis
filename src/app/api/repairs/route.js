export const runtime = "edge";

import { NextResponse } from "next/server";

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  const res = await fetch(
    `${supabaseUrl}/rest/v1/equipment_repairs?select=*,clients(name,phone,email)&order=created_at.desc`,
    {
      headers: {
        apikey: supabaseAnonKey,
        Authorization: `Bearer ${supabaseAnonKey}`,
      },
    }
  );

  if (!res.ok) {
    return NextResponse.json(
      { error: "Failed to fetch from Supabase" },
      { status: res.status }
    );
  }

  const data = await res.json();
  return NextResponse.json(data);
}
