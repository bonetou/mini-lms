"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api/client";
import { queryKeys } from "@/lib/query/keys";
import { CurrentUser } from "@/lib/types/frontend";

type LoginInput = {
  email: string;
  password: string;
};

type SignUpInput = {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
};

type LoginResponse = {
  user: {
    id: string;
    email: string | null;
  } | null;
  profile: CurrentUser["profile"];
  roles: string[];
};

type SignUpResponse = {
  user: {
    id: string;
    email: string | null;
  } | null;
  session: {
    accessToken: string;
    expiresAt: number | null;
  } | null;
};

export function useMeQuery() {
  return useQuery({
    queryKey: queryKeys.me,
    queryFn: () => apiRequest<CurrentUser>("/api/auth/me"),
  });
}

export function useLoginMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: LoginInput) =>
      apiRequest<LoginResponse>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify(input),
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.me });
    },
  });
}

export function useSignUpMutation() {
  return useMutation({
    mutationFn: (input: SignUpInput) =>
      apiRequest<SignUpResponse>("/api/auth/sign-up", {
        method: "POST",
        body: JSON.stringify(input),
      }),
  });
}

export function useLogoutMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () =>
      apiRequest<{ success: true }>("/api/auth/logout", {
        method: "POST",
      }),
    onSuccess: async () => {
      await queryClient.resetQueries({ queryKey: queryKeys.me });
      await queryClient.invalidateQueries({ queryKey: ["consultations"] });
    },
  });
}
