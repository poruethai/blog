"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  Plus,
  Edit2,
  Trash2,
  ExternalLink,
  Settings,
  LayoutDashboard,
} from "lucide-react";
import { useRouter } from "next/navigation"; 
import useUser from "@/utils/useUser";

export default function DashboardPage() {
  const { data: user, loading: userLoading } = useUser();
  const queryClient = useQueryClient();
  const router = useRouter(); 

  const { data, isLoading } = useQuery({
    queryKey: ["my-posts", user?.id],
    queryFn: async () => {
      const res = await fetch(`/api/posts?authorId=${user.id}`);
      if (!res.ok) throw new Error("Failed to fetch posts");
      return res.json();
    },
    enabled: !!user?.id,
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const res = await fetch(`/api/posts/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete post");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-posts"] });
    },
  });

  if (userLoading || isLoading) {
    return (
      <div className="py-24 text-center uppercase tracking-widest text-gray-400">
        Loading Dashboard...
      </div>
    );
  }

  if (!user) {
    router.push("/account/signin");
    return null;
  }

  const posts = data?.posts || [];

  return (
    <div className="space-y-12 font-sans">
      <header className="flex flex-col space-y-4 border-b border-black pb-8 md:flex-row md:items-end md:justify-between md:space-y-0">
        <div className="space-y-2">
          <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-widest text-gray-400">
            <LayoutDashboard size={14} />
            <span>Dashboard</span>
          </div>
          <h1 className="text-3xl sm:text-5xl lg:text-7xl font-bold tracking-tight">Your Stories</h1>
        </div>

        <a
          href="/dashboard/new"
          className="inline-flex items-center border border-black bg-black px-6 py-3 text-xs font-bold uppercase tracking-widest text-white transition-colors hover:bg-white hover:text-black"
        >
          <Plus className="mr-2 h-4 w-4" />
          Write New
        </a>
      </header>

      <section>
        {posts.length > 0 ? (
          <div className="divide-y divide-gray-100">
            {posts.map((post) => (
              <div
                key={post.id}
                className="group py-8 px-5 transition-colors hover:bg-gray-50/50"
              >
                <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-3 text-[10px] uppercase tracking-widest font-bold">
                      <span
                        className={
                          post.published ? "text-green-500" : "text-orange-500"
                        }
                      >
                        {post.published ? "Published" : "Draft"}
                      </span>
                      <span className="text-gray-300">•</span>
                      <span className="text-gray-400 font-medium">
                        {format(new Date(post.createdAt), "MMM d, yyyy")}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold tracking-tight">
                      {post.title}
                    </h3>
                  </div>

                  <div className="flex items-center space-x-2 sm:space-x-4">
                    <a
                      href={`/post/${post.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 text-gray-400 hover:text-black transition-colors"
                      title="View Public"
                    >
                      <ExternalLink size={18} />
                    </a>
                    <a
                      href={`/dashboard/edit/${post.id}`}
                      className="p-2 text-gray-400 hover:text-black transition-colors"
                      title="Edit Story"
                    >
                      <Edit2 size={18} />
                    </a>
                    <button
                      onClick={() => {
                        if (
                          confirm("Are you sure you want to delete this story?")
                        ) {
                          deleteMutation.mutate(post.id);
                        }
                      }}
                      className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                      title="Delete Story"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-24 text-center border-2 border-dashed border-gray-100 rounded-3xl">
            <p className="text-lg text-gray-400 font-light">
              You haven't written any stories yet.
            </p>
            <a
              href="/dashboard/new"
              className="mt-6 inline-block text-sm font-bold border-b-2 border-black pb-1"
            >
              Write your first story
            </a>
          </div>
        )}
      </section>

      <section className="pt-12">
        <div className="rounded-3xl border border-gray-400 bg-white p-8">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="text-xl font-bold">Profile Settings</h3>
              <p className="text-sm text-gray-500">
                Manage your public bio and appearance.
              </p>
            </div>
            <a
              href={`/profile/${user.id}`} 
              className="rounded-full bg-gray-60 p-4 hover:bg-gray-100 transition-colors"
            >
              <Settings size={20} />
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}