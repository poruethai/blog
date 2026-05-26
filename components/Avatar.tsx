import { User } from "lucide-react";

interface AvatarProps {
  src?: string | null;
  alt?: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizes = {
  sm:  "h-8 w-8",
  md:  "h-12 w-12",
  lg:  "h-16 w-16",
  xl:  "h-20 w-20",
};

const iconSizes = {
  sm:  "h-4 w-4",
  md:  "h-6 w-6",
  lg:  "h-8 w-8",
  xl:  "h-10 w-10",
};

export default function Avatar({
  src,
  alt = "Avatar",
  size = "md",
  className = "",
}: AvatarProps) {
  return (
    <div
      className={`${sizes[size]} shrink-0 overflow-hidden rounded-full border border-gray-100 bg-gray-50 flex items-center justify-center ${className}`}
    >
      {src ? (
        <img
          src={src}
          alt={alt}
          className="h-full w-full object-cover"
        />
      ) : (
        <User className={`${iconSizes[size]} text-gray-300`} />
      )}
    </div>
  );
}