"use client";

import {
  isServer,
  MutationCache,
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import dynamic from "next/dynamic";
import { toast } from "sonner";

const ReactQueryDevtools = dynamic(
  () =>
    import("@tanstack/react-query-devtools").then(
      (module) => module.ReactQueryDevtools,
    ),
  { ssr: false },
);
import { FrontendApiError } from "@/lib/api-client";

// ─── Factory ────────────────────────────────────────────────────────────────
function makeQueryClient() {
  return new QueryClient({
    queryCache: new QueryCache({
      onError: (error, query) => {
        if (query?.meta?.preventToast) return;
        if (error instanceof FrontendApiError && error.statusCode === 429) return;
        const message =
          error instanceof Error ? error.message : "Something went wrong";
        toast.error(message);
      },
    }),
    mutationCache: new MutationCache({
      onError: (error) => {
        if (error instanceof FrontendApiError && error.statusCode === 429) return;
        const message =
          error instanceof Error ? error.message : "Something went wrong";
        toast.error(message);
      },
    }),
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
        gcTime: 5 * 60 * 1000,
        retry: 2,
        refetchOnWindowFocus: false,
        // Serves cached data even when the browser reports offline.
        networkMode: "offlineFirst",
      },
    },
  });
}

// ─── Browser Singleton ───────────────────────────────────────────────────────
// Module-level variable survives re-renders and Suspense boundary re-mounts.
let browserQueryClient: QueryClient | undefined = undefined;

function getQueryClient() {
  if (isServer) {
    // Server: always a fresh client — prevents cross-request data leakage
    return makeQueryClient();
  }
  // Browser: reuse existing client so the cache is never wiped by a re-mount
  if (!browserQueryClient) browserQueryClient = makeQueryClient();
  return browserQueryClient;
}

import { TooltipProvider } from "@/components/ui/tooltip";

// ─── Provider ────────────────────────────────────────────────────────────────
export function Providers({ children }: { children: React.ReactNode }) {
  const queryClient = getQueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider delayDuration={0}>
        {children}
      </TooltipProvider>
      {process.env.NODE_ENV === "development" ? (
        <ReactQueryDevtools initialIsOpen={false} />
      ) : null}
    </QueryClientProvider>
  );
}
