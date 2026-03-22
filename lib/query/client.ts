import { QueryClient } from "@tanstack/react-query";
import { ApiClientError } from "@/lib/api/client";

export function createAppQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        retry(failureCount, error) {
          if (error instanceof ApiClientError) {
            return error.status >= 500 && failureCount < 2;
          }

          return failureCount < 2;
        },
      },
      mutations: {
        retry: false,
      },
    },
  });
}
