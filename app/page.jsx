import { prisma } from "@/lib/prisma";
import PostCard from "@/components/PostCard";

export default async function HomePage() {
  const posts = await prisma.post.findMany({
    where: {
      published: true,
    },
    include: {
      author: {
        select: {
          id: true,
          username: true,
        }
      }
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <div className="space-y-16">
      {/* HERO SECTION */}
      <section className="border-b border-black pb-16">
        <h1 className="text-6xl font-bold tracking-tighter sm:text-8xl">
          Write
          <br />
          Freely.
        </h1>

        <p className="mt-8 max-w-xl text-xl font-light leading-relaxed text-gray-500">
          A space for deep thoughts and clean prose. Join a community of writers
          focused on clarity and substance.
        </p>
      </section>

      {/* POSTS */}
      <section>
        {posts.length > 0 ? (
          <div className="divide-y divide-gray-100">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
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