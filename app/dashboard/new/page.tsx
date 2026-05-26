"use client";

// ─────────────────────────────────────────────────────────────────────────────
// วิธีใช้:
//   สร้างโพสต์ใหม่ → app/editor/page.tsx  (ไม่มี params)
//   แก้ไขโพสต์    → app/editor/[id]/page.tsx  (ไฟล์นี้)
// ─────────────────────────────────────────────────────────────────────────────

import { use, useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Save, Send, X } from "lucide-react";
import { useRouter } from "next/navigation";
import useUser from "@/utils/useUser";

// ── Types ────────────────────────────────────────────────────────────────────
interface EditorPageProps {
  // Next.js 15+ → params เป็น Promise ต้อง unwrap ด้วย use()
  params: Promise<{ id: string }>;
}

// ── Component ────────────────────────────────────────────────────────────────
export default function EditorPage({ params }: EditorPageProps) {
  // ★ FIX 1: Next.js 15+ params เป็น Promise → ต้องใช้ React.use() unwrap
  const { id } = use(params);
  const isEditing = !!id;

  const router = useRouter();
  const queryClient = useQueryClient();

  // ★ FIX 2: ตรวจว่า login อยู่หรือเปล่า ถ้าไม่มี session → redirect
  const { user, loading } = useUser();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // redirect ถ้าไม่ได้ login
  useEffect(() => {
    if (!loading && !user) {
      router.push("/account/signin");
    }
  }, [user, loading, router]);

  // ── Fetch post เมื่อ edit ─────────────────────────────────────────────────
  const { data: postData } = useQuery({
    queryKey: ["post", id],
    queryFn: async () => {
      const res = await fetch(`/api/posts/${id}`);
      if (!res.ok) throw new Error("Post not found");
      return res.json();
    },
    // ★ FIX 3: enabled ป้องกัน fetch เมื่อไม่มี id
    enabled: isEditing,
  });

  // ★ FIX 4: React Query v5 ลบ onSuccess ออกจาก useQuery แล้ว
  //          ต้องใช้ useEffect ดักข้อมูลแทน
  useEffect(() => {
    if (postData?.post) {
      setTitle(postData.post.title ?? "");
      setContent(postData.post.content ?? "");
      setExcerpt(postData.post.excerpt ?? "");
      // ★ FIX 5: schema ใช้ coverImage ไม่ใช่ cover_image
      setCoverImage(postData.post.coverImage ?? "");
    }
  }, [postData]);

  // ── Mutation ──────────────────────────────────────────────────────────────
  const mutation = useMutation({
    mutationFn: async (published: boolean) => {
      const url = isEditing ? `/api/posts/${id}` : "/api/posts";
      const method = isEditing ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          content,
          excerpt,
          // ★ FIX 5: ใช้ coverImage ตาม schema ไม่ใช่ cover_image
          coverImage,
          published,
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "Failed to save post");
      }

      return res.json();
    },

    onSuccess: (data, published) => {
      queryClient.invalidateQueries({ queryKey: ["my-posts"] });

      if (published && data.post?.slug) {
        // ★ FIX 6: redirect ไป slug ไม่ใช่ id
        // ★ FIX 7: ใช้ router.push แทน window.location.href (Next.js way)
        router.push(`/post/${data.post.slug}`);
      } else {
        router.push("/dashboard");
      }
    },

    onError: (or) => {
      setErrorMsg(err.message);
    },
  });

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleSave = (published: boolean) => {
    setErrorMsg(null);
    if (!title.trim() || !content.trim()) {
      setErrorMsg("Title and content are required");
      return;
    }
    mutation.mutate(published);
  };

  // ── Loading guard ─────────────────────────────────────────────────────────
  if (loading) return null;
  if (!user) return null;

  // ── UI ────────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-12 font-sans pb-24">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-black pb-8">
        <a
          href="/dashboard"
          className="inline-flex items-center text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-black"
        >
          <ArrowLeft className="mr-2 h-3 w-3" />
          Dashboard
        </a>

        <div className="flex items-center space-x-4">
          {/* Error message */}
          {errorMsg && (
            <span className="text-xs text-red-500">{errorMsg}</span>
          )}

          <button
            onClick={() => handleSave(false)}
            // ★ FIX 8: v5 ใช้ isPending ไม่ใช่ isLoading
            disabled={mutation.isPending}
            className="inline-flex items-center text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-black disabled:opacity-50"
          >
            <Save className="mr-2 h-4 w-4" />
            Save Draft
          </button>

          <button
            onClick={() => handleSave(true)}
            disabled={mutation.isPending}
            className="inline-flex items-center border border-black bg-black px-6 py-2 text-xs font-bold uppercase tracking-widest text-white transition-colors hover:bg-white hover:text-black disabled:opacity-50"
          >
            <Send className="mr-2 h-4 w-4" />
            Publish
          </button>
        </div>
      </header>

      {/* Editor */}
      <section className="max-w-3xl mx-auto space-y-12">
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Title of your story..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full text-5xl font-bold tracking-tight outline-none placeholder:text-gray-100"
          />

          <div className="flex flex-col space-y-4 border-l-2 border-gray-100 pl-6">
            <textarea
              placeholder="A short summary (excerpt)..."
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              className="w-full text-lg font-light text-gray-500 outline-none resize-none placeholder:text-gray-200"
              rows={2}
            />

            <div className="flex items-center space-x-4">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Cover image URL..."
                  value={coverImage}
                  onChange={(e) => setCoverImage(e.target.value)}
                  className="w-full text-xs font-medium uppercase tracking-widest outline-none bg-gray-50 p-3 rounded-lg"
                />
              </div>
              {coverImage && (
                <button
                  onClick={() => setCoverImage("")}
                  className="text-gray-300 hover:text-red-500"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          </div>
        </div>

        <textarea
          placeholder="Tell your story..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full min-h-[500px] text-xl font-light leading-relaxed outline-none resize-none placeholder:text-gray-100"
        />
      </section>
    </div>
  );
}