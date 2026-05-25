"use client";

import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Save, User, Camera, Check } from "lucide-react";
import useUser from "@/utils/useUser";

export default function ProfileSettingsPage() {
  const { data: userData, loading: userLoading } = useUser();
  const queryClient = useQueryClient();

  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [message, setMessage] = useState(null);

  const { data: profileData, isLoading } = useQuery({
    queryKey: ["profile", userData?.id],
    queryFn: async () => {
      const res = await fetch("/api/profile");
      if (!res.ok) throw new Error("Failed to fetch profile");
      return res.json();
    },
    enabled: !!userData?.id,
  });

  // ★ FIX: React Query v5 ลบ onSuccess ออกจาก useQuery แล้ว ใช้ useEffect แทน
  useEffect(() => {
    if (profileData?.profile) {
      setUsername(profileData.profile.username || "");
      setFullName(profileData.profile.fullName || "");
      setBio(profileData.profile.bio || "");
      setAvatarUrl(profileData.profile.avatarUrl || "");
    }
  }, [profileData]);

  const mutation = useMutation({
    mutationFn: async (updatedProfile) => {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedProfile),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "Failed to update profile");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      setMessage({ type: "success", text: "Profile updated successfully." });
      setTimeout(() => setMessage(null), 3000);
    },
    onError: (err) => {
      setMessage({ type: "error", text: err.message || "Failed to update profile." });
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate({
      username,
      fullName,   // ★ FIX: ใช้ camelCase ตาม Prisma schema
      bio,
      avatarUrl,  // ★ FIX: ใช้ camelCase ตาม Prisma schema
    });
  };

  if (userLoading || isLoading)
    return (
      <div className="py-24 text-center uppercase tracking-widest text-gray-400">
        Loading Settings...
      </div>
    );

  return (
    <div className="space-y-12 font-sans max-w-2xl mx-auto pb-24">
      <header className="flex items-center justify-between border-b border-black pb-8">
        <a
          href="/dashboard"
          className="inline-flex items-center text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-black"
        >
          <ArrowLeft className="mr-2 h-3 w-3" />
          Dashboard
        </a>
        <h1 className="text-xl font-bold uppercase tracking-widest">
          Settings
        </h1>
      </header>

      <form onSubmit={handleSubmit} className="space-y-12">
        <div className="flex flex-col items-center space-y-6 sm:flex-row sm:items-center sm:space-x-12 sm:space-y-0">
          <div className="relative group">
            <div className="h-32 w-32 overflow-hidden rounded-full border-2 border-gray-100 bg-gray-50 transition-colors group-hover:border-black">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="Avatar"
                  className="h-full w-full object-cover"
                />
              ) : (
                <User className="h-full w-full p-8 text-gray-300" />
              )}
            </div>
            <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/20 rounded-full">
              <Camera className="text-white opacity-0 transition-opacity group-hover:opacity-100" />
            </div>
          </div>

          <div className="flex-1 w-full space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
              Avatar URL
            </label>
            <input
              type="text"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              placeholder="https://example.com/photo.jpg"
              className="w-full border-b border-gray-100 py-2 outline-none focus:border-black transition-colors bg-transparent"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-12 sm:grid-cols-2">
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
              Username
            </label>
            <input
              required
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full border-b border-gray-100 py-2 outline-none focus:border-black transition-colors"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
              Full Name
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full border-b border-gray-100 py-2 outline-none focus:border-black transition-colors"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
            Bio
          </label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={4}
            placeholder="Tell your readers about yourself..."
            className="w-full border border-gray-100 p-4 outline-none focus:border-black transition-colors resize-none rounded-xl"
          />
        </div>

        {message && (
          <div
            className={`flex items-center p-4 rounded-xl text-sm font-medium ${
              message.type === "success"
                ? "bg-green-50 text-green-700"
                : "bg-red-50 text-red-700"
            }`}                                                                                                                                                                 
          >
            {message.type === "success" && <Check size={16} className="mr-2" />}
            {message.text}
          </div>
        )}

        <button
          type="submit"
          disabled={mutation.isPending} // ★ FIX: v5 ใช้ isPending ไม่ใช่ isLoading
          className="w-full border border-black bg-black py-4 text-xs font-bold uppercase tracking-[0.2em] text-white transition-all hover:bg-white hover:text-black disabled:opacity-50"
        >
          {mutation.isPending ? "Saving..." : "Update Profile"} {/* ★ FIX */}
        </button>
      </form>
    </div>
  );
}