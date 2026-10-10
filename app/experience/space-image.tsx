"use client";
import { useState } from "react";
import Image from "next/image";
import { ImageOff } from "lucide-react";
/** Keep legacy external uploads working; optimize only the configured storage origin. */
export function SpaceImage({
  src,
  alt,
  sizes,
  preload = false,
}: {
  src: string;
  alt: string;
  sizes: string;
  preload?: boolean;
}) {
  const [failed, setFailed] = useState(false);
  const local = src.startsWith("/");
  const optimized =
    local ||
    src.startsWith(
      "https://vhxcxsklfqbpncssoyfq.supabase.co/storage/v1/object/public/",
    );
  if (failed)
    return (
      <span
        className="v2-image-fallback"
        role="img"
        aria-label={"ไม่สามารถโหลดรูป " + alt}
      >
        <ImageOff size={24} />
        <small>รูปพื้นที่ไม่พร้อมแสดง</small>
      </span>
    );
  return (
    <Image
      src={src || "/favicon.svg"}
      alt={alt}
      fill
      sizes={sizes}
      preload={preload}
      unoptimized={!optimized || src.endsWith(".svg")}
      onError={() => setFailed(true)}
    />
  );
}
