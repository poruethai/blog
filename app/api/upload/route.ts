import { auth } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";
import { NextResponse } from "next/server";

const BUCKET = "post-images"; // ชื่อ bucket ใน Supabase Storage
const MAX_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export async function POST(request: Request) {
  // ตรวจ session
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // validate type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Only JPEG, PNG, WebP, GIF allowed" },
        { status: 400 }
      );
    }

    // validate size
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: "File too large (max 5MB)" },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // path: {userId}/{timestamp}-{filename}
    const ext = file.name.split(".").pop();
    const filename = `${session.user.id}/${Date.now()}.${ext}`;

    const { error: uploadError } = await supabaseAdmin.storage
      .from(BUCKET)
      .upload(filename, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error("Supabase upload error", uploadError);
      return NextResponse.json({ error: "Upload failed" }, { status: 500 });
    }

    // get public URL
    const { data } = supabaseAdmin.storage
      .from(BUCKET)
      .getPublicUrl(filename);

    return NextResponse.json({ url: data.publicUrl });
  } catch (err) {
    console.error("POST /api/upload error", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}