import { cookies } from "next/headers";
import { createServerClient as createSupabaseServerClient } from "@supabase/ssr";

export async function createServerClient() {
  const cookieStore = await cookies();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error("Missing Supabase environment variables.");
  }

  return createSupabaseServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          console.log("Setting cookies:", cookiesToSet.map(c => c.name));
          cookiesToSet.forEach(({ name, value, options }) => {
            // In development, allow insecure cookies for localhost
            if (process.env.NODE_ENV === "development") {
              options.secure = false;
            }
            cookieStore.set(name, value, options);
          });
        } catch (error) {
          console.error("Error setting cookies in createServerClient:", error);
          // Server Components can't set cookies; ignore in those contexts.
        }
      },
    },
  });
}
