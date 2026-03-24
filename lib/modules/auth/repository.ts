import { SupabaseClient } from "@supabase/supabase-js";
import { AppProfile } from "@/lib/api/auth-context";
import { extractRoleName } from "@/lib/api/roles";
import { createAdminClient } from "@/lib/supabase/admin";

type SignUpInput = {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  emailRedirectTo?: string;
};

type LoginInput = {
  email: string;
  password: string;
};

type ForgotPasswordInput = {
  email: string;
  redirectTo: string;
};

type UpdatePasswordInput = {
  password: string;
};

export class AuthRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async signUp(input: SignUpInput) {
    return this.supabase.auth.signUp({
      email: input.email,
      password: input.password,
      options: {
        emailRedirectTo: input.emailRedirectTo,
        data: {
          first_name: input.firstName,
          last_name: input.lastName,
        },
      },
    });
  }

  async signIn(input: LoginInput) {
    return this.supabase.auth.signInWithPassword(input);
  }

  async signOut() {
    return this.supabase.auth.signOut();
  }

  async getUser() {
    return this.supabase.auth.getUser();
  }

  async resetPasswordForEmail(input: ForgotPasswordInput) {
    return this.supabase.auth.resetPasswordForEmail(input.email, {
      redirectTo: input.redirectTo,
    });
  }

  async updateUserPassword(input: UpdatePasswordInput) {
    return this.supabase.auth.updateUser({
      password: input.password,
    });
  }
}

export class AuthAdminRepository {
  private readonly supabase = createAdminClient();

  async getProfileByUserId(userId: string): Promise<AppProfile | null> {
    const result = await this.supabase
      .from("profiles")
      .select("id,email,first_name,last_name,created_at,updated_at")
      .eq("id", userId)
      .maybeSingle();

    if (result.error) {
      throw result.error;
    }

    if (!result.data) {
      return null;
    }

    return {
      id: result.data.id,
      email: result.data.email,
      firstName: result.data.first_name,
      lastName: result.data.last_name,
      createdAt: result.data.created_at,
      updatedAt: result.data.updated_at,
    };
  }

  async getRolesByUserId(userId: string) {
    const result = await this.supabase
      .from("user_roles")
      .select("role:roles(name)")
      .eq("user_id", userId);

    if (result.error) {
      throw result.error;
    }

    return result.data
      .map((entry) => extractRoleName(entry.role))
      .filter((role): role is string => Boolean(role));
  }
}
