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

  // Search for equipment by manufacturer, model, equipment_type, or serial_number
  // Use separate queries like order_number search for reliability
  const [manufacturerData, modelData, typeData, serialData] = await Promise.all([
    supabase
      .from('equipment_repairs')
      .select('*, clients(name, phone)')
      .ilike('manufacturer', `%${query}%`),
    supabase
      .from('equipment_repairs')
      .select('*, clients(name, phone)')
      .ilike('model', `%${query}%`),
    supabase
      .from('equipment_repairs')
      .select('*, clients(name, phone)')
      .ilike('equipment_type', `%${query}%`),
    supabase
      .from('equipment_repairs')
      .select('*, clients(name, phone)')
      .ilike('serial_number', `%${query}%`)
  ]);

  // Combine all results and remove duplicates by ID
  const allEquipmentResults = [
    ...(manufacturerData.data || []),
    ...(modelData.data || []),
    ...(typeData.data || []),
    ...(serialData.data || [])
  ];
  
  const uniqueEquipmentResults = Array.from(
    new Map(allEquipmentResults.map(item => [item.id, item])).values()
  );
  
  const repairsByEquipment = uniqueEquipmentResults;


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
    repairsByEquipment: repairsByEquipment || [],
  };

  return NextResponse.json(results);
} 