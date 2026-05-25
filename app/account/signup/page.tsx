"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import useAuth from "@/utils/useAuth";
import { ArrowLeft } from "lucide-react";

export default function SignUpPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const router = useRouter();
  // ★ FIX: ใช้ `register` ซึ่งเป็น function จริงที่ export ออกมา
  const { register } = useAuth();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!email || !password || !username) {
      setError("Please fill in all fields");
      setLoading(false);
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      setLoading(false);
      return;
    }

    try {
      const result = await register({ email, password, username });

      if (result?.error) {
        setError("Could not complete sign-up. Please try again.");
        setLoading(false);
        return;
      }

      // สมัครและ login สำเร็จ → ไป dashboard
      router.push("/dashboard");
      router.refresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Something went wrong.";
      // แปลง error message จาก API ให้อ่านง่าย
      const errorMessages: Record<string, string> = {
        "This email is already registered": "This email is already in use.",
        "This username is already registered": "This username is taken.",
      };
      setError(errorMessages[msg] ?? msg);
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-white p-4 font-sans text-black">
      <div className="w-full max-w-md space-y-8">
        <div className="space-y-2 text-center">
          <h1 className="text-4xl font-bold tracking-tight">
            Create an account
          </h1>
          <p className="text-sm text-gray-500">
            Join the minimalist blog community
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium uppercase tracking-wider text-gray-500">
                Username
              </label>
              <input
                required
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your name"
                className="w-full border-b border-gray-200 py-2 outline-none transition-colors focus:border-black"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium uppercase tracking-wider text-gray-500">
                Email
              </label>
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full border-b border-gray-200 py-2 outline-none transition-colors focus:border-black"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium uppercase tracking-wider text-gray-500">
                Password
              </label>
              <input
                required
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full border-b border-gray-200 py-2 outline-none transition-colors focus:border-black"
              />
            </div>
          </div>

          {error && (
            <p className="text-center text-sm text-red-500">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full border border-black bg-black py-3 text-sm font-medium uppercase tracking-widest text-white transition-all hover:bg-white hover:text-black disabled:opacity-50"
          >
            {loading ? "Creating..." : "Sign Up"}
          </button>
        </form>

        <div className="text-center text-sm">
          <span className="text-gray-500">Already have an account? </span>
          <a href="/account/signin" className="font-medium hover:underline">
            Sign in
          </a>
        </div>

        <div className="flex justify-center pt-4">
          <a
            href="/"
            className="flex items-center text-xs uppercase tracking-widest text-gray-400 hover:text-black"
          >
            <ArrowLeft className="mr-2 h-3 w-3" />
            Back to Home
          </a>
        </div>
      </div>
    </div>
  );
}