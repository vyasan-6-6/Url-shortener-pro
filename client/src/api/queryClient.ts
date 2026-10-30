import { QueryClient } from '@tanstack/react-query';

// Configure and export a unified QueryClient instance
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false, // Prevents reloading data every time tab gains focus
      retry: 1
    }
  }
});
