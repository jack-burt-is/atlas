import { QueryClient } from "@tanstack/react-query";
import { ApiError } from "@atlas/shared";

export { ApiError };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        if (error instanceof ApiError && error.status === 401) return false;
        return failureCount < 2;
      },
      staleTime: 60_000,
    },
  },
});
