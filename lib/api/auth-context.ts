import { User } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@/lib/supabase/route-handler";
import { createAdminClient } from "@/lib/supabase/admin";
import { errorResponse } from "./http";
import { ApiError } from "./errors";
import { extractRoleName } from "./roles";

export type AppProfile = {
  id: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  createdAt: string;
  updatedAt: string;
};

export type AuthContext = {
  routeClient: ReturnType<typeof createRouteHandlerClient>;
  user: User;
  profile: AppProfile | null;
  roles: string[];
  isAdmin: boolean;
};

export async function getAuthContext(
  request: NextRequest,
): Promise<AuthContext | null> {
  const routeClient = createRouteHandlerClient(request);
  const {
    data: { user },
    error,
  } = await routeClient.supabase.auth.getUser();

  if (error) {
    throw ApiError.unauthorized(error.message);
  }

  if (!user) {
    return null;
  }

  const adminClient = createAdminClient();
  const profileResult = await adminClient
    .from("profiles")
    .select("id,email,first_name,last_name,created_at,updated_at")
    .eq("id", user.id)
    .maybeSingle();

  if (profileResult.error) {
    throw ApiError.internal("Failed to load profile", profileResult.error);
  }

  const rolesResult = await adminClient
    .from("user_roles")
    .select("role:roles(name)")
    .eq("user_id", user.id);

  if (rolesResult.error) {
    throw ApiError.internal("Failed to load roles", rolesResult.error);
  }

  const roles = rolesResult.data
    .map((entry) => extractRoleName(entry.role))
    .filter((role): role is string => Boolean(role));

  return {
    routeClient,
    user,
    profile: profileResult.data
      ? {
          id: profileResult.data.id,
          email: profileResult.data.email,
          firstName: profileResult.data.first_name,
          lastName: profileResult.data.last_name,
          createdAt: profileResult.data.created_at,
          updatedAt: profileResult.data.updated_at,
        }
      : null,
    roles,
    isAdmin: roles.includes("admin"),
  };
}

export async function requireAuthContext(request: NextRequest) {
  const context = await getAuthContext(request);

  if (!context) {
    throw ApiError.unauthorized();
  }

  return context;
}

export async function requireAdminContext(request: NextRequest) {
  const context = await requireAuthContext(request);

  if (!context.isAdmin) {
    throw ApiError.forbidden();
  }

  return context;
}

export async function withApiHandler(
  request: NextRequest,
  handler: (
    context: ReturnType<typeof createRouteHandlerClient>,
  ) => Promise<NextResponse>,
) {
  const routeClient = createRouteHandlerClient(request);

  try {
    const response = await handler(routeClient);
    return routeClient.applyCookies(response);
  } catch (error) {
    return routeClient.applyCookies(errorResponse(error));
  }
}
