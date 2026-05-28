import { prisma } from "@/lib/prisma";
import PostCard from "@/components/PostCard";
import Link from "next/link";

const POSTS_PER_PAGE = 10;

export default async function HomePage({ searchParams }) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params?.page || "1"));
  const skip = (page - 1) * POSTS_PER_PAGE;

  const [posts, totalCount] = await Promise.all([
    prisma.post.findMany({
      where: { published: true },
      include: {
        author: {
          select: { id: true, username: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take: POSTS_PER_PAGE,
      skip,
    }),
    prisma.post.count({ where: { published: true } }),
  ]);

  const totalPages = Math.ceil(totalCount / POSTS_PER_PAGE);
  const hasPrev = page > 1;
  const hasNext = page < totalPages;

  return (
    <div className="space-y-16">
      {/* HERO SECTION */}
      <section className="border-b border-black pb-16">
        <h1 className="text-2xl font-bold tracking-tighter sm:text-5xl">
          Write
          <br />
          Freely.
        </h1>
        <p className="mt-6 max-w-xl text-l font-light leading-relaxed text-gray-500">
          A space for deep thoughts and clean prose. Join a community of writers
          focused on clarity and substance.
        </p>
      </section>

      {/* POSTS */}
      <section>
        {posts.length > 0 ? (
          <>
            <div className="divide-y divide-gray-100">
              {posts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>

            {/* PAGINATION */}
            <div className="mt-16 flex items-center justify-between border-t border-gray-100 pt-8">
              <Link
                href={hasPrev ? `/?page=${page - 1}` : "#"}
                className={`text-xs font-bold uppercase tracking-widest border-b border-black pb-0.5 transition-opacity ${
                  !hasPrev ? "opacity-20 pointer-events-none" : "hover:opacity-60"
                }`}
              >
                ← Previous
              </Link>

              <span className="text-xs text-gray-400 uppercase tracking-widest">
                Page {page} / {totalPages}
              </span>

              <Link
                href={hasNext ? `/?page=${page + 1}` : "#"}
                className={`text-xs font-bold uppercase tracking-widest border-b border-black pb-0.5 transition-opacity ${
                  !hasNext ? "opacity-20 pointer-events-none" : "hover:opacity-60"
                }`}
              >
                Next →
              </Link>
            </div>
          </>
        ) : (
          <div className="py-24 text-center">
            <h3 className="text-lg font-medium">No stories yet.</h3>
            <p className="text-gray-500">
              Be the first to share your thoughts.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}