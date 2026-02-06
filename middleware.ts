import { NextRequest, NextResponse } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function middleware(request: NextRequest) {
  const response = NextResponse.next({ request: { headers: request.headers } });

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      get(name: string) {
        return request.cookies.get(name)?.value;
      },
      set(name: string, value: string, options?: CookieOptions) {
        response.cookies.set({
          name,
          value,
          path: "/",
          sameSite: "lax",
          ...options,
          secure: process.env.NODE_ENV === "production",
        });
      },
      remove(name: string, options?: CookieOptions) {
        response.cookies.set({
          name,
          value: "",
          path: "/",
          sameSite: "lax",
          ...options,
          secure: process.env.NODE_ENV === "production",
          maxAge: 0,
        });
      },
    },
  });

  // Refresh session if needed. getUser() is more secure and reliable than getSession()
  // as it re-validates the user with the Supabase auth server.
  await supabase.auth.getUser();

  return response;
}

export const config = {
  matcher: ["/admin/:path*", "/cleaner/:path*"],
};
