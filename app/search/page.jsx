"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search as SearchIcon, Feather, ArrowRight } from "lucide-react";
import PostCard from "@/components/PostCard";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  // auto debounce 400ms
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query.trim());
    }, 400);
    return () => clearTimeout(timer);
  }, [query]);

  const { data, isLoading } = useQuery({
    queryKey: ["search", debouncedQuery],
    queryFn: async () => {
      const res = await fetch(`/api/search?q=${encodeURIComponent(debouncedQuery)}`);
      if (!res.ok) throw new Error("Search failed");
      return res.json();
    },
    enabled: debouncedQuery.length > 2,
  });

  const posts = data?.posts || [];

  return (
    <div className="space-y-16 py-12">
      <header className="space-y-8">
        <h1 className="text-4xl font-bold tracking-tighter">Explore.</h1>

        <div className="relative group">
          <input
            type="text"
            placeholder="Search stories, authors, topics..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full border-b-2 border-gray-100 bg-transparent py-4 text-2xl font-light outline-none transition-colors focus:border-black placeholder:text-gray-200"
          />
          <button
            onClick={() => setDebouncedQuery(query.trim())}
            className="absolute right-0 top-1/2 -translate-y-1/2 p-2 text-gray-300 hover:text-black transition-colors"
          >
            <ArrowRight size={24} />
          </button>
        </div>
      </header>

      <section>
        {isLoading ? (
          <div className="space-y-12">
            {[1, 2].map((i) => (
              <div key={i} className="animate-pulse space-y-4 border-b border-gray-100 py-12">
                <div className="h-3 w-32 bg-gray-100" />
                <div className="h-10 w-3/4 bg-gray-100" />
                <div className="h-4 w-full bg-gray-50" />
              </div>
            ))}
          </div>
        ) : posts.length > 0 ? (
          <div className="divide-y divide-gray-100">
            <p className="pb-8 text-xs font-bold uppercase tracking-widest text-gray-400">
              Found {posts.length} result{posts.length !== 1 ? "s" : ""} for &quot;{debouncedQuery}&quot;
            </p>
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        ) : debouncedQuery.length > 2 ? (
          <div className="py-24 text-center">
            <SearchIcon className="mx-auto h-12 w-12 text-gray-100" />
            <h3 className="mt-4 text-xl font-bold">No matches found.</h3>
            <p className="text-gray-500 font-light mt-2">
              Try different keywords or browse the feed.
            </p>
          </div>
        ) : (
          <div className="py-24 text-center">
            <Feather className="mx-auto h-12 w-12 text-gray-100" />
            <p className="mt-4 text-xl font-light text-gray-400">
              What are you looking for?
            </p>
          </div>
        )}
      </section>
    </div>
  );
}