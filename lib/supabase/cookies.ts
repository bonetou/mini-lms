import { type CookieOptionsWithName } from "@supabase/ssr";

export function withAuthCookieOptions(
  options: CookieOptionsWithName = {},
): CookieOptionsWithName {
  return {
    ...options,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: options.path ?? "/",
  };
}
