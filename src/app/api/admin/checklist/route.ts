import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createRouteHandlerClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { label, labels, location_id } = body ?? {};

    const rawLabels: unknown[] = [];
    if (Array.isArray(labels)) rawLabels.push(...labels);
    if (typeof label === "string") rawLabels.push(label);

    const cleanedLabels = rawLabels
      .map((value) => (typeof value === "string" ? value.trim() : ""))
      .filter(Boolean);

    if (cleanedLabels.length === 0) {
      return NextResponse.json({ error: "Label is required." }, { status: 400 });
    }

    const isDefault = !location_id;

    const rows = cleanedLabels.map((value, index) => ({
      label: value,
      is_default: isDefault,
      location_id: isDefault ? null : location_id,
      sort_order: index,
    }));

    const { data, error } = await supabase
      .from("checklist_items")
      .insert(rows)
      .select("id, label, is_active");

    if (error || !data) {
      return NextResponse.json({ error: "Unable to create checklist item." }, { status: 400 });
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error("POST /api/admin/checklist error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
