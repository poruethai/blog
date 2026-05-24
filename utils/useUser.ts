"use client";

import { useSession } from "next-auth/react";
import { useCallback } from "react";

export const useUser = () => {
  const { data: session, status, update } = useSession();

  const user = session?.user ?? null;

  // optional refetch (NextAuth built-in)
  const refetch = useCallback(() => {
    update(); // refresh session from server
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