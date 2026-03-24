/** localStorage key for admin draft previews (shared across tabs, same origin). */
export function adminPreviewStorageKey(type: string): string {
  return `agency-theme-preview-${type}`;
}

export function openAdminPreview(type: string, payload: unknown): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(adminPreviewStorageKey(type), JSON.stringify(payload));
  } catch {
    window.alert(
      "Could not store preview (content may be too large). Try a smaller image or shorter text.",
    );
    return;
  }
  window.open(`/preview/${type}`, "_blank", "noopener,noreferrer");
}

export function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

export async function resolvePreviewImageUrl(
  file: File | undefined,
  imagePreview: string | null,
  storedUrl: string,
): Promise<string> {
  if (file) return readFileAsDataURL(file);
  if (imagePreview && !imagePreview.startsWith("blob:")) return imagePreview;
  return storedUrl?.trim() ?? "";
}

export function isFormCheckboxChecked(form: HTMLFormElement, name: string): boolean {
  const el = form.elements.namedItem(name);
  return el instanceof HTMLInputElement && el.type === "checkbox" && el.checked;
}
