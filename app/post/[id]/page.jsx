import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import { ArrowLeft, User } from "lucide-react";
import { notFound } from "next/navigation";

// ── Metadata ──────────────────────────────────────────────────────────────────
export async function generateMetadata({ params }) {
  const { slug } = await params;

  const post = await prisma.post.findUnique({
    where: { slug },
    include: { author: true },
  });

  if (!post) return { title: "Post Not Found" };

  return {
    title: `${post.title} | Minimal Blog`,
    description: post.excerpt || `Read ${post.title} on Minimal Blog.`,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: post.coverImage ? [{ url: post.coverImage }] : [],
    },
  };
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default async function PostDetailPage({ params }) {
  const { slug } = await params;

  const post = await prisma.post.findUnique({
    where: { slug },
    include: { author: true },
  });

  if (!post || !post.published) notFound();

  return (
    <article className="font-sans">
      <header className="space-y-8 pb-16 pt-8">
        <a
          href="/"
          className="inline-flex items-center text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-black transition-colors"
        >
          <ArrowLeft className="mr-2 h-3 w-3" />
          Back to Feed
        </a>

        <h1 className="text-5xl font-bold tracking-tight text-black sm:text-7xl leading-[1.1]">
          {post.title}
        </h1>

        <div className="flex items-center space-x-6 border-t border-gray-100 pt-8">
          <a
            href={`/profile/${post.authorId}`}
            className="flex items-center space-x-4 group"
          >
            <div className="h-12 w-12 overflow-hidden rounded-full border border-gray-100 bg-gray-50 transition-transform group-hover:scale-105 flex items-center justify-center">
              <User className="h-6 w-6 text-gray-300" />
            </div>
            <div>
              <p className="text-sm font-bold uppercase tracking-widest">
                {post.author.username}
              </p>
              <p className="text-xs text-gray-400 uppercase tracking-widest font-medium mt-1">
                {format(new Date(post.createdAt), "MMMM d, yyyy")}
              </p>
            </div>
          </a>
        </div>
      </header>

      {post.coverImage && (
        <div className="mb-16 aspect-[21/9] w-full overflow-hidden bg-gray-50">
          <img
            src={post.coverImage}
            alt={post.title}
            className="h-full w-full object-cover"
          />
        </div>
      )}

      <div className="prose prose-xl prose-stone max-w-none prose-headings:tracking-tight prose-headings:font-bold prose-p:leading-relaxed prose-p:text-gray-700 prose-p:font-light prose-a:text-black prose-a:font-medium whitespace-pre-wrap">
        {post.content}
      </div>

      <footer className="mt-24 border-t border-gray-100 pt-16">
        <div className="rounded-2xl bg-gray-50 p-8 sm:p-12">
          <div className="flex flex-col items-start space-y-6 sm:flex-row sm:items-center sm:space-x-8 sm:space-y-0">
            <div className="h-20 w-20 overflow-hidden rounded-full border-2 border-white shadow-sm bg-white flex items-center justify-center">
              <User className="h-10 w-10 text-gray-300" />
            </div>
            <div className="flex-1 space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-widest text-gray-400">
                Written by
              </h4>
              <h3 className="text-2xl font-bold">{post.author.username}</h3>
              <a
                href={`/profile/${post.authorId}`}
                className="mt-4 inline-block text-sm font-bold border-b border-black pb-0.5"
              >
                View Profile
              </a>
            </div>
          </div>
        </div>
      </footer>
    </article>
  );
}