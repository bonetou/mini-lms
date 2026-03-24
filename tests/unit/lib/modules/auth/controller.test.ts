import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AuthController } from "@/lib/modules/auth/controller";

const authServiceMock = {
  forgotPassword: vi.fn(),
  signUp: vi.fn(),
  login: vi.fn(),
  logout: vi.fn(),
  me: vi.fn(),
  updatePassword: vi.fn(),
};

describe("auth controllers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("signUp passes the request origin as emailRedirectTo", async () => {
    authServiceMock.signUp.mockResolvedValue({
      user: {
        id: "user-1",
        email: "user@example.com",
      },
      session: null,
    });

    const controller = new AuthController(authServiceMock);
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

    const response = await controller.signUp(request);

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

  it("login validates the request body before calling the service", async () => {
    authServiceMock.login.mockResolvedValue({
      user: {
        id: "user-1",
        email: "user@example.com",
      },
      profile: null,
      roles: ["student"],
    });

    const controller = new AuthController(authServiceMock);
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

    const response = await controller.login(request);

    expect(authServiceMock.login).toHaveBeenCalledWith({
      email: "user@example.com",
      password: "password123",
    });
    expect(response.status).toBe(200);
  });

  it("login rejects invalid input", async () => {
    const controller = new AuthController(authServiceMock);
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

    await expect(controller.login(request)).rejects.toHaveProperty(
      "name",
      "ZodError",
    );
    expect(authServiceMock.login).not.toHaveBeenCalled();
  });

  it("forgotPassword passes the request origin as redirectTo", async () => {
    authServiceMock.forgotPassword.mockResolvedValue({ success: true });

    const controller = new AuthController(authServiceMock);
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

    const response = await controller.forgotPassword(request);

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

  it("updatePassword validates and returns success", async () => {
    authServiceMock.updatePassword.mockResolvedValue({ success: true });

    const controller = new AuthController(authServiceMock);
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

    const response = await controller.updatePassword(request);

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

  it("logout returns the service response", async () => {
    authServiceMock.logout.mockResolvedValue({ success: true });

    const controller = new AuthController(authServiceMock);
    const response = await controller.logout();

    expect(authServiceMock.logout).toHaveBeenCalled();
    await expect(response.json()).resolves.toEqual({
      data: { success: true },
      error: null,
      meta: null,
    });
  });

  it("me returns the current user payload", async () => {
    authServiceMock.me.mockResolvedValue({
      user: {
        id: "user-1",
        email: "user@example.com",
      },
      profile: null,
      roles: ["admin"],
      isAdmin: true,
    });

    const controller = new AuthController(authServiceMock);
    const response = await controller.me();

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
