"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import Avatar from "@/components/Avatar";

export default function PostCard({ post }) {
  return (
    <article className="group border-b border-gray-100 py-12">
      <div className="flex flex-col md:flex-row md:space-x-8">
        <div className="flex-1 space-y-4">
          {/* META */}
          <div className="flex items-center space-x-3 text-[10px] uppercase tracking-[0.2em] text-gray-400">
            <Avatar
              src={post.author?.image}
              alt={post.author?.username}
              size="sm"
            />

            <Link
              href={`/profile/${post.authorId}`}
              className="hover:text-black transition-colors font-medium"
            >
              {post.author?.username || "Anonymous"}
            </Link>

            <span className="h-1 w-1 rounded-full bg-gray-200" />

            <span>
              {new Date(post.createdAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
          </div>

          {/* TITLE */}
          <Link href={`/post/${post.slug}`}>
            <h2 className="text-3xl font-bold transition-colors group-hover:text-gray-600">
              {post.title}
            </h2>
            {post.excerpt && (
              <p className="mt-4 text-gray-500 font-light">{post.excerpt}</p>
            )}
          </Link>

          {/* LINK */}
          <Link
            href={`/post/${post.slug}`}
            className="inline-flex items-center text-xs font-bold uppercase border-b border-black"
          >
            Read Article
            <ArrowUpRight className="ml-1 h-3 w-3" />
          </Link>
        </div>

        {/* COVER IMAGE */}
        {post.coverImage && (
          <div className="mt-6 aspect-square overflow-hidden md:mt-0 md:w-64">
            <img
              src={post.coverImage}
              alt={post.title}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </div>
        )}
      </div>
    </article>
  );
}