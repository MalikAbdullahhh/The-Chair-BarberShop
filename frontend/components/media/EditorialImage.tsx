"use client";

import NextImage, { type ImageProps } from "next/image";
import { useEffect, useMemo, useState } from "react";

const portraitFallback = "/media/fallback-portrait.svg";
const editorialFallback = "/media/fallback-editorial.svg";

function fallbackFor(alt: string) {
  const value = alt.toLowerCase();
  return value.includes("barber") || value.includes("portrait") || value.includes("client") || value.includes("hair")
    ? portraitFallback
    : editorialFallback;
}

export function EditorialImage({ src, alt, onError, unoptimized, ...props }: ImageProps) {
  const fallback = useMemo(() => fallbackFor(String(alt || "")), [alt]);
  const [current, setCurrent] = useState<ImageProps["src"]>(src || fallback);

  useEffect(() => setCurrent(src || fallback), [src, fallback]);

  const remote = typeof current === "string" && /^https?:\/\//i.test(current);

  return (
    <NextImage
      {...props}
      src={current || fallback}
      alt={alt}
      unoptimized={unoptimized ?? remote}
      onError={(event) => {
        if (current !== fallback) setCurrent(fallback);
        onError?.(event);
      }}
    />
  );
}
