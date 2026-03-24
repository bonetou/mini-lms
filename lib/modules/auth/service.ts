import { ApiError } from "@/lib/api/errors";
import { AuthRepository, AuthAdminRepository } from "./repository";

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

export type AuthRepositoryLike = Pick<
  AuthRepository,
  | "signUp"
  | "signIn"
  | "signOut"
  | "getUser"
  | "resetPasswordForEmail"
  | "updateUserPassword"
>;

export type AuthAdminRepositoryLike = Pick<
  AuthAdminRepository,
  "getProfileByUserId" | "getRolesByUserId"
>;

export class AuthService {
  constructor(
    private readonly repository: AuthRepositoryLike,
    private readonly adminRepository: AuthAdminRepositoryLike,
  ) {}

  async signUp(input: SignUpInput) {
    const { data, error } = await this.repository.signUp(input);

    if (error) {
      throw ApiError.badRequest(error.message);
    }

    return {
      user: data.user
        ? {
            id: data.user.id,
            email: data.user.email ?? null,
          }
        : null,
      session: data.session
        ? {
            accessToken: data.session.access_token,
            expiresAt: data.session.expires_at ?? null,
          }
        : null,
    };
  }

  async login(input: LoginInput) {
    const { data, error } = await this.repository.signIn(input);

    if (error) {
      throw ApiError.badRequest(error.message);
    }

    const profile = data.user
      ? await this.adminRepository.getProfileByUserId(data.user.id)
      : null;
    const roles = data.user
      ? await this.adminRepository.getRolesByUserId(data.user.id)
      : [];

    return {
      user: data.user
        ? {
            id: data.user.id,
            email: data.user.email ?? null,
          }
        : null,
      profile,
      roles,
    };
  }

  async logout() {
    const { error } = await this.repository.signOut();

    if (error) {
      throw ApiError.badRequest(error.message);
    }

    return {
      success: true,
    };
  }

  async me() {
    const {
      data: { user },
      error,
    } = await this.repository.getUser();

    if (error) {
      throw ApiError.unauthorized(error.message);
    }

    if (!user) {
      throw ApiError.unauthorized();
    }

    const [profile, roles] = await Promise.all([
      this.adminRepository.getProfileByUserId(user.id),
      this.adminRepository.getRolesByUserId(user.id),
    ]);

    return {
      user: {
        id: user.id,
        email: user.email ?? null,
      },
      profile,
      roles,
      isAdmin: roles.includes("admin"),
    };
  }

  async forgotPassword(input: ForgotPasswordInput) {
    const { error } = await this.repository.resetPasswordForEmail(input);

    if (error) {
      throw ApiError.badRequest(error.message);
    }

    return {
      success: true,
    };
  }

  async updatePassword(input: UpdatePasswordInput) {
    const { error } = await this.repository.updateUserPassword(input);

    if (error) {
      throw ApiError.badRequest(error.message);
    }

    return {
      success: true,
    };
  }
}
