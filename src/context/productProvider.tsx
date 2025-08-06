"use client";
import { createContext, useContext } from "react";

interface ProductContextType {
}

const ProductContext = createContext<ProductContextType>({
});

export function ProductProvider({ children }: { children: React.ReactNode }) {

  return (
    <ProductContext.Provider value={{  }}>
      {children}
    </ProductContext.Provider>
  );
}

export function useProduct() {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error("ProductContext에서 벗어났습니다.");
  }
  return context;
}
