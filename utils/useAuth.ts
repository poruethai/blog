"use client";

import { useCallback } from "react";
import { signIn, signOut } from "next-auth/react";

export default function useAuth() {
  // LOGIN (credentials)
  const login = useCallback(async (email: string, password: string) => {
    return signIn("credentials", {
      email,
      password,
      redirect: false,
    });
  }, []);

  // REGISTER (ใช้ credentials เหมือนกัน แต่ส่ง flag)
  const register = useCallback(async (data: {
    email: string;
    password: string;
    name?: string;
  }) => {
    return signIn("credentials", {
      ...data,
      action: "register",
      redirect: false,
    });
  }, []);

  // SOCIAL LOGIN
  const loginWithGoogle = useCallback(() => {
    return signIn("google", { callbackUrl: "/" });
  }, []);

  const loginWithGithub = useCallback(() => {
    return signIn("github", { callbackUrl: "/" });
  }, []);

  // LOGOUT
  const logout = useCallback(async () => {
    return signOut({ callbackUrl: "/" });
  }, []);

  return {
    login,
    register,
    loginWithGoogle,
    loginWithGithub,
    logout,
  };
}