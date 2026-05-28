import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, username: true, email: true, image: true, bio: true },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json({ user });
}

export async function PATCH(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { username, bio, image } = await request.json();

    if (username) {
      const existing = await prisma.user.findFirst({
        where: { username, NOT: { id: session.user.id } },
      });
      if (existing) {
        return NextResponse.json(
          { error: "Username already taken" },
          { status: 409 }
        );
      }
    }

    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        ...(username && { username }),
        ...(bio !== undefined && { bio }),
        ...(image !== undefined && { image }),
      },
      select: { id: true, username: true, email: true, image: true, bio: true },
    });

    return NextResponse.json({ user });
  } catch (err) {
    console.error("PATCH /api/profile error", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}