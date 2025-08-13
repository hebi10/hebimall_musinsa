'use client';

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { AuthProvider } from "@/context/authProvider";
import { ProductProvider } from "@/context/productProvider";
import { PointProvider } from "@/context/pointProvider";
import { CategoryProvider } from "@/context/categoryProvider";
import { ReviewProvider } from "@/context/reviewProvider";
import { UserActivityProvider } from "@/context/userActivityProvider";
import { useState } from "react";
import { CouponProvider } from "@/context/couponProvider";
import { EventProvider } from "@/context/eventProvider";

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
              <UserActivityProvider>
                <ReviewProvider>
                  <EventProvider>
                    <CouponProvider>
                      {children}
                    </CouponProvider>
                  </EventProvider>
                </ReviewProvider>
              </UserActivityProvider>
            </ProductProvider>
          </PointProvider>
        </CategoryProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
