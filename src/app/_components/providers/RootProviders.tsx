'use client';

import { AuthProvider } from "@/context/authProvider";
import { ProductProvider } from "@/context/productProvider";
import { PointProvider } from "@/context/pointProvider";
import { CategoryProvider } from "@/context/categoryProvider";
import { ReviewProvider } from "@/context/reviewProvider";
import { UserActivityProvider } from "@/context/userActivityProvider";
import { CouponProvider } from "@/context/couponProvider";
import { EventProvider } from "@/context/eventProvider";
import { ScrollToTop } from "../ScrollToTop";
import ReactQueryProvider from "./ReactQueryProvider";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ReactQueryProvider>
      <AuthProvider>
        <CategoryProvider>
          <PointProvider>
            <ProductProvider>
              <UserActivityProvider>
                <ReviewProvider>
                  <EventProvider>
                    <CouponProvider>
                      <ScrollToTop />
                      {children}
                    </CouponProvider>
                  </EventProvider>
                </ReviewProvider>
              </UserActivityProvider>
            </ProductProvider>
          </PointProvider>
        </CategoryProvider>
      </AuthProvider>
    </ReactQueryProvider>
  );
}
