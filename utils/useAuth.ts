"use client";

import { useCallback } from "react";
import { signIn, signOut } from "next-auth/react";

export default function useAuth() {
  const login = useCallback(async (email: string, password: string) => {
    return signIn("credentials", {
      email,
      password,
      redirect: false,
    });
  }, []);

  const register = useCallback(
    async (data: { email: string; password: string; username: string }) => {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "Registration failed");
      }

      return signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });
    },
    []
  );

  const logout = useCallback(async () => {
    return signOut({ callbackUrl: "/" });
  }, []);

  return {
    login,
    register,
    logout,
  };
}