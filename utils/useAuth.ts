"use client";

import { useCallback } from "react";
import { signIn, signOut } from "next-auth/react";

export default function useAuth() {
  // ─── LOGIN ────────────────────────────────────────────────────
  const login = useCallback(async (email: string, password: string) => {
    return signIn("credentials", {
      email,
      password,
      redirect: false,
    });
  }, []);

  // ─── REGISTER ─────────────────────────────────────────────────
  // 1. เรียก /api/register เพื่อสร้าง user ในฐานข้อมูลก่อน
  // 2. จากนั้น signIn ทันที (ไม่ต้อง redirect ไป login page)
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

      // สมัครสำเร็จ → login ทันที
      return signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });
    },
    []
  );

  // ─── LOGOUT ───────────────────────────────────────────────────
  const logout = useCallback(async () => {
    return signOut({ callbackUrl: "/" });
  }, []);

  return {
    login,
    register,
    logout,
  };
}