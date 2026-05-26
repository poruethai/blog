"use client";

import { useCallback, useState } from "react";
import { ImageIcon, Upload, X, Loader2 } from "lucide-react";

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
}

export default function ImageUpload({ value, onChange }: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const upload = useCallback(async (file: File) => {
    setError(null);
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Upload failed");
      }

      onChange(data.url);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setIsUploading(false);
    }
  }, [onChange]);

  const handleFile = useCallback((file: File) => {
    const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowed.includes(file.type)) {
      setError("Only JPEG, PNG, WebP, GIF allowed");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("File too large (max 5MB)");
      return;
    }
    upload(file);
  }, [upload]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = ""; // reset input
  };

  // ── มีรูปแล้ว → แสดง preview ────────────────────────────────────────────
  if (value) {
    return (
      <div className="relative">
        <div className="aspect-[21/9] w-full overflow-hidden bg-gray-50">
          <img
            src={value}
            alt="Cover"
            className="h-full w-full object-cover"
          />
        </div>
        <button
          type="button"
          onClick={() => onChange("")}
          className="absolute right-3 top-3 flex items-center space-x-1 bg-black/60 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-sm hover:bg-black transition-colors"
        >
          <X size={12} />
          <span>Remove</span>
        </button>
      </div>
    );
  }

  // ── ยังไม่มีรูป → dropzone ───────────────────────────────────────────────
  return (
    <div>
      <label
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`flex aspect-[21/9] w-full cursor-pointer flex-col items-center justify-center border-2 border-dashed transition-colors ${
          isDragging
            ? "border-black bg-gray-50"
            : "border-gray-200 hover:border-gray-400"
        }`}
      >
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="hidden"
          onChange={handleInputChange}
          disabled={isUploading}
        />

        {isUploading ? (
          <div className="flex flex-col items-center space-y-3 text-gray-400">
            <Loader2 className="h-8 w-8 animate-spin" />
            <p className="text-xs font-medium uppercase tracking-widest">
              Uploading...
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center space-y-3 text-gray-300">
            <div className="flex items-center space-x-2">
              <ImageIcon size={32} />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-gray-400">
                Drop image here or{" "}
                <span className="text-black underline">browse</span>
              </p>
              <p className="mt-1 text-xs text-gray-300">
                JPEG, PNG, WebP, GIF · max 5MB
              </p>
            </div>
          </div>
        )}
      </label>

      {error && (
        <p className="mt-2 text-xs text-red-500">{error}</p>
      )}
    </div>
  );
}