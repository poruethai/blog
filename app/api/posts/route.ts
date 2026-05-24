import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const authorId = searchParams.get("authorId");
  const limit = parseInt(searchParams.get("limit") || "10");
  const offset = parseInt(searchParams.get("offset") || "0");

  try {
    let posts;

    if (authorId) {
      const session = await auth();

      const isOwner = session?.user?.id === authorId;

      if (isOwner) {
        posts = await prisma.post.findMany({
          where: {
            authorId,
          },
          include: {
            author: true,
          },
          orderBy: {
            createdAt: "desc",
          },
          take: limit,
          skip: offset,
        });
      } else {
        posts = await prisma.post.findMany({
          where: {
            authorId,
            published: true,
          },
          include: {
            author: true,
          },
          orderBy: {
            createdAt: "desc",
          },
          take: limit,
          skip: offset,
        });
      }
    } else {
      posts = await prisma.post.findMany({
        where: {
          published: true,
        },
        include: {
          author: true,
        },
        orderBy: {
          createdAt: "desc",
        },
        take: limit,
        skip: offset,
      });
    }

    return NextResponse.json({ posts });
  } catch (error) {
    console.error("GET /api/posts error", error);

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session || !session.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();

    const {
      title,
      content,
      excerpt,
      coverImage,
      published,
    } = body;

    if (!title || !content) {
      return NextResponse.json(
        { error: "Title and content are required" },
        { status: 400 }
      );
    }

    const slug =
      title
        .toLowerCase()
        .replace(/[^\w\s-]/g, "")
        .replace(/[\s_-]+/g, "-")
        .replace(/^-+|-+$/g, "") +
      "-" +
      Math.random().toString(36).substring(2, 7);

    const post = await prisma.post.create({
      data: {
        title,
        slug,
        content,
        excerpt,
        coverImage,
        published: published || false,
        authorId: session.user.id,
      },
    });

    return NextResponse.json({ post });
  } catch (error) {
    console.error("POST /api/posts error", error);

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}