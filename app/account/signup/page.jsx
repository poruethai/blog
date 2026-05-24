"use client";

import { useState } from "react";
import useAuth from "@/utils/useAuth";
import { ArrowLeft } from "lucide-react";

function MainComponent() {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const { signUpWithCredentials } = useAuth();

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!email || !password) {
      setError("Please fill in all fields");
      setLoading(false);
      return;
    }

    try {
      await signUpWithCredentials({
        email,
        password,
        callbackUrl: "/dashboard",
        redirect: true,
      });
    } catch (err) {
      const errorMessages = {
        OAuthSignin: "Couldn’t start sign-up. Please try again.",
        EmailCreateAccount: "This email may already be registered.",
        CredentialsSignin: "Invalid email or password.",
      };

      setError(
        errorMessages[err.message] || "Something went wrong. Please try again.",
      );
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
                Email
              </label>
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
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

          {error && <p className="text-center text-sm text-red-500">{error}</p>}

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

export default MainComponent;



