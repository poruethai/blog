import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q")?.trim();

  if (!query || query.length <= 2) {
    return NextResponse.json({ posts: [] });
  }

  try {
    const posts = await prisma.post.findMany({
      where: {
        published: true,
        OR: [
          { title: { contains: query, mode: "insensitive" } },
          { content: { contains: query, mode: "insensitive" } },
          { excerpt: { contains: query, mode: "insensitive" } },
          { author: { username: { contains: query, mode: "insensitive" } } },
        ],
      },
      include: {
        author: {
            select: { id: true, username: true, image: true}
        }
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 20,
    });

    return NextResponse.json({ posts });
  } catch (err) {
    console.error("GET /api/search error", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}