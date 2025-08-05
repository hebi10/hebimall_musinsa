"use client";
import { createContext, useContext } from "react";

interface OrderContextType {
}

const OrderContext = createContext<OrderContextType>({
});

export function OrderProvider({ children }: { children: React.ReactNode }) {

  return (
    <OrderContext.Provider value={{  }}>
      {children}
    </OrderContext.Provider>
  );
}

export function useOrder() {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error("OrderContext에서 벗어났습니다.");
  }
  return context;
}
