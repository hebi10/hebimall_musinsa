'use client';

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { AuthProvider } from "@/context/authProvider";
import { ProductProvider } from "@/context/productProvider";
import { PointProvider } from "@/context/pointProvider";
import { CategoryProvider } from "@/context/categoryProvider";
import { useState } from "react";
import { CouponProvider } from "@/context/couponProvider";

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
        <CategoryProvider>
          <PointProvider>
            <ProductProvider>
              <CouponProvider>
                {children}
              </CouponProvider>
            </ProductProvider>
          </PointProvider>
        </CategoryProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
