"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import useUser from "@/utils/useUser";
import Avatar from "@/components/Avatar";
import ImageUpload from "@/components/ImageUpload";

export default function ProfileSettingsPage() {
  const { user: sessionUser, loading: sessionLoading } = useUser();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [image, setImage] = useState("");
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showUploader, setShowUploader] = useState(false);

  // redirect ถ้าไม่ได้ login
  useEffect(() => {
    if (!sessionLoading && !sessionUser) {
      router.push("/account/signin");
    }
  }, [sessionUser, sessionLoading, router]);

  // ── Fetch ─────────────────────────────────────────────────────────────────
  const { data, isLoading } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const res = await fetch("/api/profile");
      if (!res.ok) throw new Error("Failed to load profile");
      return res.json();
    },
    enabled: !!sessionUser,
  });

  useEffect(() => {
    if (data?.user) {
      setUsername(data.user.username ?? "");
      setBio(data.user.bio ?? "");
      setImage(data.user.image ?? "");
    }
  }, [data]);

  // ── Mutation ──────────────────────────────────────────────────────────────
  const mutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, bio, image }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || "Failed to save");
      return body;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      setSuccessMsg("Profile saved!");
      setShowUploader(false);
      setTimeout(() => setSuccessMsg(null), 3000);
    },
    onError: (err) => {
      setErrorMsg(err.message);
    },
  });

  const handleSave = () => {
    setErrorMsg(null);
    if (!username.trim()) {
      setErrorMsg("Username is required");
      return;
    }
    mutation.mutate();
  };

  // เมื่ออัพโหลดรูปเสร็จ → บันทึกทันที
  const handleImageChange = (url: string) => {
    setImage(url);
    setShowUploader(false);
  };

  if (sessionLoading || isLoading) {
    return (
      <div className="py-24 text-center text-gray-400 uppercase tracking-widest text-xs">
        Loading...
      </div>
    );
  }

  return (
    <div className="space-y-12 font-sans">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-black pb-8">
        <div className="space-y-1">
          <a
            href="/dashboard"
            className="inline-flex items-center text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-black"
          >
            <ArrowLeft className="mr-2 h-3 w-3" />
            Dashboard
          </a>
          <h1 className="text-4xl font-bold tracking-tight mt-5">Profile Settings</h1>
        </div>

        <button
          onClick={handleSave}
          disabled={mutation.isPending}
          className="inline-flex items-center border border-black bg-black px-6 py-2 text-xs font-bold uppercase tracking-widest text-white transition-colors hover:bg-white hover:text-black disabled:opacity-50"
        >
          {mutation.isPending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          Save
        </button>
      </header>

      {/* Messages */}
      {successMsg && (
        <p className="text-sm font-medium text-green-600">{successMsg}</p>
      )}
      {errorMsg && (
        <p className="text-sm font-medium text-red-500">{errorMsg}</p>
      )}

      <div className="max-w-2xl space-y-12">
        {/* Avatar */}
        <section className="space-y-4">
          <label className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">
            Profile Photo
          </label>

          <div className="flex items-center space-x-6">
            <Avatar src={image} alt={username} size="xl" />

            <div className="space-y-2">
              <button
                type="button"
                onClick={() => setShowUploader((v) => !v)}
                className="text-sm font-bold border-b border-black pb-0.5 hover:text-gray-600 transition-colors"
              >
                {image ? "Change Photo" : "Upload Photo"}
              </button>
              {image && (
                <button
                  type="button"
                  onClick={() => setImage("")}
                  className="block text-xs text-gray-400 hover:text-red-500 transition-colors"
                >
                  Remove
                </button>
              )}
            </div>
          </div>

          {showUploader && (
            <div className="mt-4">
              <ImageUpload value="" onChange={handleImageChange} />
            </div>
          )}
        </section>

        {/* Username */}
        <section className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-gray-400">
            Username
          </label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full border-b border-gray-200 py-2 text-lg font-medium outline-none transition-colors focus:border-black"
            placeholder="your_username"
          />
        </section>

        {/* Bio */}
        <section className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-gray-400">
            Bio
          </label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={4}
            maxLength={300}
            className="w-full border-b border-gray-200 py-2 text-base font-light leading-relaxed text-gray-700 outline-none transition-colors focus:border-black resize-none"
            placeholder="Tell readers about yourself..."
          />
          <p className="text-right text-xs text-gray-300">{bio.length}/300</p>
        </section>
      </div>
    </div>
  );
}