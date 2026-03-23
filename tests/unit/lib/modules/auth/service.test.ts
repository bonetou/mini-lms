import { beforeEach, describe, expect, it, vi } from "vitest";
import { AuthService } from "@/lib/modules/auth/service";

const { authRepositoryMock, authAdminRepositoryMock } = vi.hoisted(() => ({
  authRepositoryMock: {
    signUp: vi.fn(),
    signIn: vi.fn(),
    signOut: vi.fn(),
    getUser: vi.fn(),
  },
  authAdminRepositoryMock: {
    getProfileByUserId: vi.fn(),
    getRolesByUserId: vi.fn(),
  },
}));

vi.mock("@/lib/modules/auth/repository", async () => {
  return {
    AuthRepository: vi.fn(() => authRepositoryMock),
    AuthAdminRepository: vi.fn(() => authAdminRepositoryMock),
  };
});

describe("AuthService", () => {
  const supabase = {} as never;
  const profile = {
    id: "user-1",
    email: "user@example.com",
    firstName: "Jane",
    lastName: "Doe",
    createdAt: "2026-03-20T10:00:00.000Z",
    updatedAt: "2026-03-20T10:00:00.000Z",
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("maps sign-up responses", async () => {
    authRepositoryMock.signUp.mockResolvedValue({
      data: {
        user: {
          id: "user-1",
          email: "user@example.com",
        },
        session: {
          access_token: "token",
          expires_at: 123,
        },
      },
      error: null,
    });

    const service = new AuthService(supabase);
    const result = await service.signUp({
      email: "user@example.com",
      password: "password",
      firstName: "Jane",
      lastName: "Doe",
    });

    expect(result).toEqual({
      user: {
        id: "user-1",
        email: "user@example.com",
      },
      session: {
        accessToken: "token",
        expiresAt: 123,
      },
    });
  });

  it("turns sign-up errors into BAD_REQUEST", async () => {
    authRepositoryMock.signUp.mockResolvedValue({
      data: {
        user: null,
        session: null,
      },
      error: {
        message: "Signup failed",
      },
    });

    const service = new AuthService(supabase);

    await expect(
      service.signUp({
        email: "user@example.com",
        password: "password",
      }),
    ).rejects.toMatchObject({
      status: 400,
      code: "BAD_REQUEST",
      message: "Signup failed",
    });
  });

  it("maps login responses with profile and roles", async () => {
    authRepositoryMock.signIn.mockResolvedValue({
      data: {
        user: {
          id: "user-1",
          email: "user@example.com",
        },
      },
      error: null,
    });
    authAdminRepositoryMock.getProfileByUserId.mockResolvedValue(profile);
    authAdminRepositoryMock.getRolesByUserId.mockResolvedValue(["student"]);

    const service = new AuthService(supabase);
    const result = await service.login({
      email: "user@example.com",
      password: "password",
    });

    expect(result).toEqual({
      user: {
        id: "user-1",
        email: "user@example.com",
      },
      profile,
      roles: ["student"],
    });
  });

  it("returns success:true on logout", async () => {
    authRepositoryMock.signOut.mockResolvedValue({
      error: null,
    });

    const service = new AuthService(supabase);

    await expect(service.logout()).resolves.toEqual({
      success: true,
    });
  });

  it("returns the current user payload from me()", async () => {
    authRepositoryMock.getUser.mockResolvedValue({
      data: {
        user: {
          id: "user-1",
          email: "user@example.com",
        },
      },
      error: null,
    });
    authAdminRepositoryMock.getProfileByUserId.mockResolvedValue(profile);
    authAdminRepositoryMock.getRolesByUserId.mockResolvedValue([
      "student",
      "admin",
    ]);

    const service = new AuthService(supabase);

    await expect(service.me()).resolves.toEqual({
      user: {
        id: "user-1",
        email: "user@example.com",
      },
      profile,
      roles: ["student", "admin"],
      isAdmin: true,
    });
  });

  it("rejects me() when no authenticated user exists", async () => {
    authRepositoryMock.getUser.mockResolvedValue({
      data: {
        user: null,
      },
      error: null,
    });

    const service = new AuthService(supabase);

    await expect(service.me()).rejects.toMatchObject({
      status: 401,
      code: "UNAUTHORIZED",
    });
  });
});
