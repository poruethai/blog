"use client";

import { useSession } from "next-auth/react";
import { useCallback } from "react";

export const useUser = () => {
  const { data: session, status, update } = useSession();

  const user = session?.user ?? null;

  const refetch = useCallback(() => {
    update(); 
  }, [update]);

  return {
    user,
    data: user,
    loading: status === "loading",
    isAuthenticated: status === "authenticated",
    refetch,
  };
};

export default useUser;