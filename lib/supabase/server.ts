import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

export const createRouteClient = () => {
  const cookieStore = cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) { return cookieStore.get(name)?.value; },
        set(name: string, value: string, options: CookieOptions) {
          try { cookieStore.set({ name, value, ...options }); } catch {}
        },
        remove(name: string, options: CookieOptions) {
          try { cookieStore.set({ name, value: "", ...options }); } catch {}
        },
      },
    }
  );
};

export async function requireUser() {
  const supabase = createRouteClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) throw new Error("Unauthorized");
  return { user, supabase };
}