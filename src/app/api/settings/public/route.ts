import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@/lib/supabase/server";

export async function GET(_request: NextRequest) {
  try {
    const supabase = await createRouteHandlerClient();
    const { data, error } = await supabase
      .from("app_settings")
      .select("company_name, logo_url, primary_color, secondary_color, geofence_enabled")
      .single();

    if (error || !data) {
      return NextResponse.json({ error: "Settings not found." }, { status: 404 });
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error("GET /api/settings/public error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
