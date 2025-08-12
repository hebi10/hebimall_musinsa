"use client";

import { OrderProvider } from "@/context/orderProvider";
import { PointProvider } from "@/context/pointProvider";

interface OrdersLayoutProps {
  children: React.ReactNode;
}

export default function OrdersLayout({ children }: OrdersLayoutProps) {
  return (
    <OrderProvider>
      <PointProvider>
        {children}
      </PointProvider>
    </OrderProvider>
  );
}
