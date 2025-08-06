'use client';

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { AuthProvider } from "@/context/authProvider";
import { ProductProvider } from "@/context/productProvider";
import { PointProvider } from "@/context/pointProvider";
import { useState } from "react";

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
      },
    },
  }));

  return (
    <QueryClientProvider client={queryClient}>
      <ReactQueryDevtools initialIsOpen={false} />
      <AuthProvider>
        <PointProvider>
          <ProductProvider>
            {children}
          </ProductProvider>
        </PointProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
