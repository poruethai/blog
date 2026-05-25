import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

// ── GET /api/profile ──────────────────────────────────────────────────────────
// ?authorId=xxx → public profile (ไม่ต้อง login)
// ไม่มี query   → profile ของตัวเอง (ต้อง login)
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const publicAuthorId = searchParams.get("authorId");

  try {
    // ── Public profile ──────────────────────────────────────────────────────
    if (publicAuthorId) {
      const user = await prisma.user.findUnique({
        where: { id: publicAuthorId },
        select: {
          id: true,
          username: true,
          fullName: true,
          bio: true,
          avatarUrl: true,
          createdAt: true,
        },
      });

      if (!user) {
        return NextResponse.json({ error: "Profile not found" }, { status: 404 });
      }

      return NextResponse.json({ profile: user });
    }

    // ── Own profile (requires auth) ─────────────────────────────────────────
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        username: true,
        fullName: true,
        bio: true,
        avatarUrl: true,
        createdAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ profile: user });
  } catch (err) {
    console.error("GET /api/profile error", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// ── PATCH /api/profile ────────────────────────────────────────────────────────
export async function PATCH(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { username, fullName, bio, avatarUrl } = await request.json();

    if (!username?.trim()) {
      return NextResponse.json(
        { error: "Username is required" },
        { status: 400 }
      );
    }

    // ตรวจ username ซ้ำ (ยกเว้นตัวเอง)
    const existing = await prisma.user.findFirst({
      where: {
        username: username.trim(),
        NOT: { id: session.user.id },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Username already taken" },
        { status: 409 }
      );
    }

    const updated = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        username: username.trim(),
        fullName: fullName?.trim() ?? null,
        bio: bio?.trim() ?? null,
        avatarUrl: avatarUrl ?? null,
      },
      select: {
        id: true,
        username: true,
        fullName: true,
        bio: true,
        avatarUrl: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ profile: updated });
  } catch (err) {
    console.error("PATCH /api/profile error", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}