import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@/lib/supabase/server";

export async function POST(_request: NextRequest) {
  try {
    const supabase = await createRouteHandlerClient();
    const { data: authData, error: authError } = await supabase.auth.getUser();

    if (authError || !authData.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { error } = await supabase.auth.signOut();

    if (error) {
      return NextResponse.json({ error: "Unable to sign out." }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("POST /api/auth/logout error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
