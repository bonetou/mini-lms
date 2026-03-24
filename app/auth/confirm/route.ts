import { createServerClient } from "@supabase/ssr";
import { type EmailOtpType } from "@supabase/supabase-js";
import { type NextRequest, NextResponse } from "next/server";
import { withAuthCookieOptions } from "@/lib/supabase/cookies";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next =
    searchParams.get("next") ?? (type === "recovery" ? "/auth/update-password" : "/");

  if (token_hash && type) {
    const successResponse = NextResponse.redirect(new URL(next, request.url));
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              successResponse.cookies.set(
                name,
                value,
                withAuthCookieOptions(options),
              ),
            );
          },
        },
      },
    );

    const { data, error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    });

    if (!error) {
      if (!data.session) {
        return NextResponse.redirect(
          new URL(
            `/auth/error?error=${encodeURIComponent("Recovery session was not created")}`,
            request.url,
          ),
        );
      }

      return successResponse;
    }

    return NextResponse.redirect(
      new URL(`/auth/error?error=${encodeURIComponent(error.message)}`, request.url),
    );
  }

  return NextResponse.redirect(
    new URL(
      `/auth/error?error=${encodeURIComponent("No token hash or type")}`,
      request.url,
    ),
  );
}
