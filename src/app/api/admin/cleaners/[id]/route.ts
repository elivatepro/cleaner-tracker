import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@/lib/supabase/server";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { sendAccountDeactivatedEmail, sendAccountReactivatedEmail } from "@/lib/email";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  try {
    const supabase = await createRouteHandlerClient();
    const {
      data: { user: currentUser },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", currentUser.id)
      .single();

    if (profile?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { is_active } = body ?? {};

    if (typeof is_active !== "boolean") {
      return NextResponse.json({ error: "is_active must be a boolean." }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("profiles")
      .update({ is_active })
      .eq("id", id)
      .select("id, full_name, email, is_active")
      .single();

    if (error || !data) {
      return NextResponse.json({ error: "Unable to update cleaner status." }, { status: 400 });
    }

    // Send status update email
    const { data: settings } = await supabase
      .from("app_settings")
      .select("company_name, logo_url")
      .single();

    const emailParams = {
      to: data.email,
      companyName: settings?.company_name || "Elivate",
      logoUrl: settings?.logo_url || undefined,
      cleanerName: data.full_name,
    };

    if (is_active) {
      void sendAccountReactivatedEmail({
        ...emailParams,
        appUrl: process.env.NEXT_PUBLIC_APP_URL || new URL(request.url).origin,
      }).catch((e) => console.error("Reactivation email error:", e));
    } else {
      void sendAccountDeactivatedEmail(emailParams).catch((e) =>
        console.error("Deactivation email error:", e)
      );
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error(`PATCH /api/admin/cleaners/${id} error:`, error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  try {
    const supabase = await createRouteHandlerClient();
    const {
      data: { user: currentUser },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", currentUser.id)
      .single();

    if (profile?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const adminSupabase = createAdminSupabaseClient();
    
    // Delete from auth.users (will cascade to profiles)
    const { error: deleteError } = await adminSupabase.auth.admin.deleteUser(id);

    if (deleteError) {
      console.error("Delete user error:", deleteError);
      return NextResponse.json({ error: "Unable to delete cleaner account." }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(`DELETE /api/admin/cleaners/${id} error:`, error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
