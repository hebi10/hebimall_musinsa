import { useQuery } from "@tanstack/react-query";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/src/libs/firebase/firebase";

async function fetchUserData(uid: string | null) {
  if (!uid) throw new Error("uid is required");
  const docRef = doc(db, "users", uid); 
  const snap = await getDoc(docRef);
  if (!snap.exists()) throw new Error("User not found");
  return snap.data();
}

// 쿼리 훅도 동일하게 string | null 타입
export function useUserData(uid: string | null) {
  const { data, isLoading, error } = useQuery({
    queryKey: ["user", uid],
    queryFn: () => fetchUserData(uid),
    enabled: !!uid,
  });
  return { data, isLoading, error };
}