/** Use with next/image `unoptimized` for local uploads and blob previews; Cloudinary URLs can stay optimized. */
export function shouldUseUnoptimizedImage(src: string): boolean {
  if (!src) return false;
  if (src.startsWith("blob:")) return true;
  if (src.startsWith("/uploads/")) return true;
  return false;
}
