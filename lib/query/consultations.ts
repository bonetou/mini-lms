"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api/client";
import { queryKeys } from "@/lib/query/keys";
import {
  AdminConsultationFilters,
  AdminConsultationListResponse,
  ConsultationDetail,
  ConsultationFilters,
  ConsultationListResponse,
  ConsultationSummary,
} from "@/lib/types/frontend";

function createSearchParams(
  filters: Record<string, string | number | undefined>,
) {
  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value === undefined || value === "" || value === null) {
      return;
    }

    params.set(key, String(value));
  });

  return params.toString();
}

export function useMyConsultationsQuery(filters: ConsultationFilters) {
  return useQuery({
    queryKey: queryKeys.consultationsMine(filters),
    queryFn: () =>
      apiRequest<ConsultationListResponse>(
        `/api/consultations?${createSearchParams(filters)}`,
      ),
  });
}

export function useAdminConsultationsQuery(filters: AdminConsultationFilters) {
  return useQuery({
    queryKey: queryKeys.consultationsAdmin(filters),
    queryFn: () =>
      apiRequest<AdminConsultationListResponse>(
        `/api/admin/consultations?${createSearchParams(filters)}`,
      ),
  });
}

export function useConsultationQuery(
  consultationId: string,
  options?: { admin?: boolean },
) {
  const endpoint = options?.admin
    ? `/api/admin/consultations/${consultationId}`
    : `/api/consultations/${consultationId}`;

  return useQuery({
    enabled: Boolean(consultationId),
    queryKey: queryKeys.consultation(consultationId),
    queryFn: () => apiRequest<ConsultationDetail>(endpoint),
  });
}

export function useCreateConsultationMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: { reason: string; scheduledAt: string }) =>
      apiRequest<ConsultationSummary>("/api/consultations", {
        method: "POST",
        body: JSON.stringify(input),
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["consultations", "mine"] });
    },
  });
}

export function useUpdateConsultationMutation(consultationId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: { reason?: string; scheduledAt?: string }) =>
      apiRequest<ConsultationSummary>(`/api/consultations/${consultationId}`, {
        method: "PATCH",
        body: JSON.stringify(input),
      }),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.consultation(consultationId) }),
        queryClient.invalidateQueries({ queryKey: ["consultations", "mine"] }),
      ]);
    },
  });
}

export function useRescheduleConsultationMutation(consultationId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: { scheduledAt: string }) =>
      apiRequest<ConsultationSummary>(
        `/api/consultations/${consultationId}/reschedule`,
        {
        method: "PATCH",
        body: JSON.stringify(input),
        },
      ),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.consultation(consultationId) }),
        queryClient.invalidateQueries({ queryKey: ["consultations", "mine"] }),
      ]);
    },
  });
}

export function useCancelConsultationMutation(consultationId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: { cancellationReason?: string }) =>
      apiRequest<ConsultationSummary>(
        `/api/consultations/${consultationId}/cancel`,
        {
        method: "PATCH",
        body: JSON.stringify(input),
        },
      ),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.consultation(consultationId) }),
        queryClient.invalidateQueries({ queryKey: ["consultations", "mine"] }),
      ]);
    },
  });
}

export function useToggleConsultationCompleteMutation(consultationId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: { isCompleted: boolean }) =>
      apiRequest<ConsultationSummary>(
        `/api/consultations/${consultationId}/toggle-complete`,
        {
        method: "PATCH",
        body: JSON.stringify(input),
        },
      ),
    onMutate: async (input) => {
      await queryClient.cancelQueries({
        queryKey: queryKeys.consultation(consultationId),
      });

      const previous = queryClient.getQueryData<ConsultationDetail>(
        queryKeys.consultation(consultationId),
      );

      if (previous) {
        queryClient.setQueryData<ConsultationDetail>(
          queryKeys.consultation(consultationId),
          {
            ...previous,
            isCompleted: input.isCompleted,
            status: input.isCompleted ? "COMPLETED" : previous.status,
          },
        );
      }

      return { previous };
    },
    onError: (_error, _input, context) => {
      if (context?.previous) {
        queryClient.setQueryData(
          queryKeys.consultation(consultationId),
          context.previous,
        );
      }
    },
    onSettled: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.consultation(consultationId) }),
        queryClient.invalidateQueries({ queryKey: ["consultations", "mine"] }),
      ]);
    },
  });
}
