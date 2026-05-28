"use client";

import { signOut } from "next-auth/react";
import { useState, useEffect } from "react";
import { Menu, X, Feather } from "lucide-react";
import useUser from "@/utils/useUser";
import Avatar from "@/components/Avatar";

export default function Header() {
  const { data: user } = useUser();
  console.log(user);

  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 z-50 w-full transition-all duration-300 ${
        isScrolled
          ? "border-b border-gray-100 bg-white/80 backdrop-blur-md"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center space-x-8">
          <a href="/" className="flex items-center space-x-2">
            <div className="bg-black p-1">
              <Feather className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tighter">BLOG.</span>
          </a>

          <nav className="hidden md:flex items-center space-x-6 text-sm font-medium uppercase tracking-widest text-gray-500">
            <a href="/" className="hover:text-black transition-colors">Feed</a>
            <a href="/search" className="hover:text-black transition-colors">Search</a>
          </nav>
        </div>

        <div className="flex items-center space-x-4">
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <>
                <a
                  href="/dashboard"
                  className="text-sm font-medium uppercase tracking-widest hover:underline decoration-2 underline-offset-4"
                >
                  Dashboard
                </a>
                <button
                  onClick={() => {
                    setIsMenuOpen(false);

                    signOut({
                      callbackUrl: "/",
                    });
                  }}
                  className="text-left text-sm font-medium uppercase tracking-widest text-gray-500"
                >
                  Logout
                </button>
                <a href={`/profile/${user.id}`}>
                  <Avatar
                    src={user.image}
                    size="md"
                    className="hover:ring-2 hover:ring-black transition-all"
                  />
                </a> 
              </>
            ) : (
              <>
                <a
                  href="/account/signin"
                  className="text-sm font-medium uppercase tracking-widest hover:underline decoration-2 underline-offset-4"
                >
                  Sign In
                </a>
                <a
                  href="/account/signup"
                  className="border border-black bg-black px-4 py-2 text-xs font-medium uppercase tracking-widest text-white transition-colors hover:bg-white hover:text-black"
                >
                  Sign Up
                </a>
              </>
            )}
          </div>

          <button className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {isMenuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 py-6 space-y-6">
          <nav className="flex flex-col space-y-4 text-sm font-medium uppercase tracking-widest text-gray-500">
            <a href="/" onClick={() => setIsMenuOpen(false)}>Feed</a>
            <a href="/search" onClick={() => setIsMenuOpen(false)}>Search</a>
            {user ? (
              <>
                <a href="/dashboard" onClick={() => setIsMenuOpen(false)}>Dashboard</a>
                <a href={`/profile/${user.id}`} onClick={() => setIsMenuOpen(false)}>Profile Settings</a>
                <button
                  onClick={() => {
                    setIsMenuOpen(false);

                    signOut({
                      callbackUrl: "/",
                    });
                  }}
                  className="text-left text-sm font-medium uppercase tracking-widest text-gray-500"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <a href="/account/signin" onClick={() => setIsMenuOpen(false)}>Sign In</a>
                <a href="/account/signup" onClick={() => setIsMenuOpen(false)}>Sign Up</a>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}

