import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q");

  if (!query) {
    return NextResponse.json({ error: "Query parameter is required" }, { status: 400 });
  }

  // Search for clients by name
  const { data: clientsByName } = await supabase
    .from('clients')
    .select('*, equipment_repairs(order_number)')
    .ilike('name', `%${query}%`);

  // Search for clients by phone
  const { data: clientsByPhone } = await supabase
    .from('clients')
    .select('*, equipment_repairs(order_number, created_at)')
    .ilike('phone', `%${query}%`);

  // Search for repairs by order number
  const { data: repairsByOrder } = await supabase
    .from('equipment_repairs')
    .select('*, clients(name, phone)')
    .ilike('order_number', `%${query}%`);

  const results = {
    clientsByName: clientsByName || [],
    clientsByPhone: (clientsByPhone || []).map(client => {
        const newestRepair = client.equipment_repairs.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0];
        return {
            ...client,
            newest_order_number: newestRepair ? newestRepair.order_number : null
        }
    }),
    repairsByOrder: repairsByOrder || [],
  };

  return NextResponse.json(results);
} 