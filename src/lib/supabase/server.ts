import { cookies } from "next/headers";
import { createServerClient as createSupabaseServerClient, type CookieOptions } from "@supabase/ssr";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!url || !anonKey) {
  throw new Error("Missing Supabase environment variables.");
}

// Server Component client (read/write cookies for refresh when possible)
export async function createServerClient() {
  const cookieStore = await cookies();

  return createSupabaseServerClient(url, anonKey, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
      set(name: string, value: string, options?: CookieOptions) {
        try {
          const cookieOptions = {
            path: "/",
            sameSite: "lax" as const,
            ...options,
            secure: process.env.NODE_ENV === "production",
          };
          cookieStore.set(name, value, cookieOptions);
        } catch (error) {
          // Ignore error if called in a Server Component during render
        }
      },
      remove(name: string, options?: CookieOptions) {
        try {
          const cookieOptions = {
            path: "/",
            sameSite: "lax" as const,
            ...options,
            secure: process.env.NODE_ENV === "production",
          };
          cookieStore.set(name, "", { ...cookieOptions, maxAge: 0 });
        } catch (error) {
          // Ignore error if called in a Server Component during render
        }
      },
    },
  });
}

// Mutable client for Route Handlers / Server Actions where cookies can be set
export async function createRouteHandlerClient() {
  const cookieStore = await cookies();

  return createSupabaseServerClient(url, anonKey, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
      set(name: string, value: string, options?: CookieOptions) {
        const cookieOptions = {
          path: "/",
          sameSite: "lax" as const,
          ...options,
          secure: process.env.NODE_ENV === "production",
        };
        cookieStore.set(name, value, cookieOptions);
      },
      remove(name: string, options?: CookieOptions) {
        const cookieOptions = {
          path: "/",
          sameSite: "lax" as const,
          ...options,
          secure: process.env.NODE_ENV === "production",
        };
        cookieStore.set(name, "", { ...cookieOptions, maxAge: 0 });
      },
    },
  });
}
