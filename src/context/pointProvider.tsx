"use client";

import { createContext, useContext, ReactNode } from "react";
import { usePointBalance, useAddPoint, useUsePoint } from "@/shared/hooks/usePoint";
import { AddPointRequest, UsePointRequest } from "@/shared/types/point";

interface PointContextType {
  pointBalance: number;
  isLoadingBalance: boolean;
  addPoint: (data: AddPointRequest) => Promise<any>;
  usePoint: (data: UsePointRequest) => Promise<any>;
  isAddingPoint: boolean;
  isUsingPoint: boolean;
  refreshBalance: () => void;
}

const PointContext = createContext<PointContextType>({
  pointBalance: 0,
  isLoadingBalance: false,
  addPoint: async () => {},
  usePoint: async () => {},
  isAddingPoint: false,
  isUsingPoint: false,
  refreshBalance: () => {},
});

interface PointProviderProps {
  children: ReactNode;
}

export function PointProvider({ children }: PointProviderProps) {
  const { data: balanceData, isLoading: isLoadingBalance, refetch: refreshBalance } = usePointBalance();
  const addPointMutation = useAddPoint();
  const usePointMutation = useUsePoint();

  const pointBalance = balanceData?.pointBalance || 0;

  const addPoint = async (data: AddPointRequest) => {
    try {
      const result = await addPointMutation.mutateAsync(data);
      return result;
    } catch (error) {
      throw error;
    }
  };

  const usePoint = async (data: UsePointRequest) => {
    try {
      const result = await usePointMutation.mutateAsync(data);
      return result;
    } catch (error) {
      throw error;
    }
  };

  const value: PointContextType = {
    pointBalance,
    isLoadingBalance,
    addPoint,
    usePoint,
    isAddingPoint: addPointMutation.isPending,
    isUsingPoint: usePointMutation.isPending,
    refreshBalance: () => refreshBalance(),
  };

  return (
    <PointContext.Provider value={value}>
      {children}
    </PointContext.Provider>
  );
}

export function usePoint() {
  const context = useContext(PointContext);
  if (!context) {
    throw new Error("usePoint must be used within a PointProvider");
  }
  return context;
}

export default PointProvider;
