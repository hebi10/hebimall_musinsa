'use client';

import OrderListPage from "./order-list/page";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthUser } from "@/src/hooks/useAuthUser";

export default function MyHomePage() {
  const user = useAuthUser();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      // Redirect to login if user is not authenticated
      router.push("/auth/login");
    }
  }, [user, router])

  if (!user) return <div>로그인이 필요합니다.</div>;

  return <OrderListPage />;
}
