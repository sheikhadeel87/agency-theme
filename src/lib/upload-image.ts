import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { v2 as cloudinary } from "cloudinary";
import type { UploadApiResponse } from "cloudinary";

/** Cloudinary callbacks often pass `{ message, http_code }`, not `Error` — normalize for UI/logs. */
export function toUploadError(err: unknown): Error {
  if (err instanceof Error) return err;
  if (err && typeof err === "object" && "message" in err) {
    const m = (err as { message?: unknown }).message;
    const http = (err as { http_code?: unknown }).http_code;
    const base = typeof m === "string" ? m : JSON.stringify(err);
    return new Error(http != null ? `${base} (HTTP ${http})` : base);
  }
  if (typeof err === "string") return new Error(err);
  try {
    return new Error(JSON.stringify(err));
  } catch {
    return new Error("Unknown upload error");
  }
}

function hasCloudinaryUrlEnv(): boolean {
  const u = process.env.CLOUDINARY_URL?.trim();
  return Boolean(u && u.toLowerCase().startsWith("cloudinary://"));
}

/**
 * When `CLOUDINARY_URL` **or** all of CLOUDINARY_CLOUD_NAME / API_KEY / API_SECRET are set,
 * uploads go to Cloudinary. Otherwise files save under `public/uploads/`.
 */
export function isCloudinaryEnabled(): boolean {
  if (hasCloudinaryUrlEnv()) return true;
  return Boolean(
    process.env.CLOUDINARY_CLOUD_NAME?.trim() &&
      process.env.CLOUDINARY_API_KEY?.trim() &&
      process.env.CLOUDINARY_API_SECRET?.trim()
  );
}

function configureCloudinary(): void {
  if (hasCloudinaryUrlEnv()) {
    // Official SDK: reads api_key, api_secret, cloud_name from CLOUDINARY_URL
    cloudinary.config(true);
    cloudinary.config({ secure: true });
    return;
  }
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
}

function sanitizePublicIdPrefix(prefix: string): string {
  const s = prefix.replace(/[^a-zA-Z0-9_-]/g, "-").replace(/-+/g, "-");
  return (s.slice(0, 80) || "img").replace(/^-|-$/g, "");
}

export type SaveUploadedAdminImageOptions = {
  /** Subfolder: `public/uploads/{storageFolder}` locally, or `agency-theme/{storageFolder}` on Cloudinary */
  storageFolder: string;
  /** Used in filename / public_id */
  idPrefix: string;
  maxBytes?: number;
  /** Logo / favicon: allow ico, svg */
  allowSvgAndIco?: boolean;
};

async function uploadToCloudinary(
  buffer: Buffer,
  mimeType: string | undefined,
  storageFolder: string,
  idPrefix: string
): Promise<string> {
  configureCloudinary();
  const safePrefix = sanitizePublicIdPrefix(idPrefix);
  const publicId = `${safePrefix}-${Date.now()}`;
  const folder = `agency-theme/${storageFolder.replace(/^\/+|\/+$/g, "")}`;

  const mime =
    mimeType && mimeType.startsWith("image/") ? mimeType : "image/jpeg";
  const dataUri = `data:${mime};base64,${buffer.toString("base64")}`;

  const result = await new Promise<UploadApiResponse>((resolve, reject) => {
    cloudinary.uploader.upload(
      dataUri,
      {
        folder,
        public_id: publicId,
        resource_type: "image",
        overwrite: false,
      },
      (err, res) => {
        if (err) {
          reject(toUploadError(err));
          return;
        }
        if (res) resolve(res);
        else reject(new Error("Cloudinary upload returned no result"));
      }
    );
  });

  return result.secure_url;
}

async function saveLocal(
  buffer: Buffer,
  storageFolder: string,
  filename: string
): Promise<string> {
  const dir = path.join(process.cwd(), "public", "uploads", storageFolder);
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, filename), buffer);
  return `/uploads/${storageFolder}/${filename}`;
}

export async function saveUploadedAdminImage(
  file: File,
  opts: SaveUploadedAdminImageOptions
): Promise<string> {
  if (opts.maxBytes !== undefined && file.size > opts.maxBytes) {
    const mb = Math.round(opts.maxBytes / (1024 * 1024));
    throw new Error(`Image must be under ${mb}MB`);
  }

  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const allowedDefault = ["jpg", "jpeg", "png", "gif", "webp"];
  const allowedExtended = [...allowedDefault, "ico", "svg"];
  const allowed = opts.allowSvgAndIco ? allowedExtended : allowedDefault;
  const safeExt = allowed.includes(ext) ? ext : opts.allowSvgAndIco ? "png" : "jpg";

  const safePrefix = sanitizePublicIdPrefix(opts.idPrefix);
  const filename = `${safePrefix}-${Date.now()}.${safeExt}`;

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  if (isCloudinaryEnabled()) {
    return uploadToCloudinary(buffer, file.type || undefined, opts.storageFolder, opts.idPrefix);
  }

  return saveLocal(buffer, opts.storageFolder, filename);
}
