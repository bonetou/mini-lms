import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  forgotPasswordController,
  loginController,
  logoutController,
  meController,
  signUpController,
  updatePasswordController,
} from "@/lib/modules/auth/controller";

const { authServiceMock, routeClientMock } = vi.hoisted(() => ({
  authServiceMock: {
    forgotPassword: vi.fn(),
    signUp: vi.fn(),
    login: vi.fn(),
    logout: vi.fn(),
    me: vi.fn(),
    updatePassword: vi.fn(),
  },
  routeClientMock: {
    supabase: {},
  },
}));

vi.mock("@/lib/api/auth-context", () => ({
  withApiHandler: vi.fn(
    async (
      _request: NextRequest,
      handler: (routeClient: typeof routeClientMock) => Promise<Response>,
    ) => {
      try {
        return await handler(routeClientMock);
      } catch (error) {
        const { errorResponse } = await import("@/lib/api/http");
        return errorResponse(error);
      }
    },
  ),
}));

vi.mock("@/lib/modules/auth/service", () => ({
  AuthService: vi.fn(() => authServiceMock),
}));

describe("auth controllers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("signUpController passes the request origin as emailRedirectTo", async () => {
    authServiceMock.signUp.mockResolvedValue({
      user: {
        id: "user-1",
        email: "user@example.com",
      },
      session: null,
    });

    const request = new NextRequest("http://localhost:3000/api/auth/sign-up", {
      method: "POST",
      body: JSON.stringify({
        email: "user@example.com",
        password: "password123",
        firstName: "Jane",
        lastName: "Doe",
      }),
      headers: {
        "content-type": "application/json",
      },
    });

    const response = await signUpController(request);

    expect(authServiceMock.signUp).toHaveBeenCalledWith({
      email: "user@example.com",
      password: "password123",
      firstName: "Jane",
      lastName: "Doe",
      emailRedirectTo: "http://localhost:3000/dashboard",
    });
    expect(response.status).toBe(201);
    await expect(response.json()).resolves.toMatchObject({
      data: {
        user: {
          id: "user-1",
          email: "user@example.com",
        },
      },
      error: null,
    });
  });

  it("loginController validates the request body before calling the service", async () => {
    authServiceMock.login.mockResolvedValue({
      user: {
        id: "user-1",
        email: "user@example.com",
      },
      profile: null,
      roles: ["student"],
    });

    const request = new NextRequest("http://localhost/api/auth/login", {
      method: "POST",
      body: JSON.stringify({
        email: "user@example.com",
        password: "password123",
      }),
      headers: {
        "content-type": "application/json",
      },
    });

    const response = await loginController(request);

    expect(authServiceMock.login).toHaveBeenCalledWith({
      email: "user@example.com",
      password: "password123",
    });
    expect(response.status).toBe(200);
  });

  it("loginController returns a BAD_REQUEST envelope for invalid input", async () => {
    const request = new NextRequest("http://localhost/api/auth/login", {
      method: "POST",
      body: JSON.stringify({
        email: "not-an-email",
        password: "",
      }),
      headers: {
        "content-type": "application/json",
      },
    });

    const response = await loginController(request);

    expect(authServiceMock.login).not.toHaveBeenCalled();
    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({
      data: null,
      error: {
        code: "BAD_REQUEST",
        message: "Request validation failed",
      },
    });
  });

  it("forgotPasswordController passes the request origin as redirectTo", async () => {
    authServiceMock.forgotPassword.mockResolvedValue({ success: true });

    const request = new NextRequest(
      "http://localhost:3000/api/auth/forgot-password",
      {
        method: "POST",
        body: JSON.stringify({
          email: "user@example.com",
        }),
        headers: {
          "content-type": "application/json",
        },
      },
    );

    const response = await forgotPasswordController(request);

    expect(authServiceMock.forgotPassword).toHaveBeenCalledWith({
      email: "user@example.com",
      redirectTo: "http://localhost:3000/auth/update-password",
    });
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      data: { success: true },
      error: null,
      meta: null,
    });
  });

  it("updatePasswordController validates and returns success", async () => {
    authServiceMock.updatePassword.mockResolvedValue({ success: true });

    const request = new NextRequest(
      "http://localhost/api/auth/update-password",
      {
        method: "POST",
        body: JSON.stringify({
          password: "password123",
        }),
        headers: {
          "content-type": "application/json",
        },
      },
    );

    const response = await updatePasswordController(request);

    expect(authServiceMock.updatePassword).toHaveBeenCalledWith({
      password: "password123",
    });
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      data: { success: true },
      error: null,
      meta: null,
    });
  });

  it("logoutController returns the service response", async () => {
    authServiceMock.logout.mockResolvedValue({ success: true });

    const response = await logoutController(
      new NextRequest("http://localhost/api/auth/logout", {
        method: "POST",
      }),
    );

    expect(authServiceMock.logout).toHaveBeenCalled();
    await expect(response.json()).resolves.toEqual({
      data: { success: true },
      error: null,
      meta: null,
    });
  });

  it("meController returns the current user payload", async () => {
    authServiceMock.me.mockResolvedValue({
      user: {
        id: "user-1",
        email: "user@example.com",
      },
      profile: null,
      roles: ["admin"],
      isAdmin: true,
    });

    const response = await meController(
      new NextRequest("http://localhost/api/auth/me"),
    );

    expect(authServiceMock.me).toHaveBeenCalled();
    await expect(response.json()).resolves.toMatchObject({
      data: {
        user: {
          id: "user-1",
          email: "user@example.com",
        },
        roles: ["admin"],
        isAdmin: true,
      },
      error: null,
    });
  });
});
