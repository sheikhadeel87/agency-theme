/** Path segment for `/services/[segment]` — slug when set, else Mongo id (legacy empty slugs). */
export function serviceDetailUrlSegment(service: { _id: string; slug: string }): string {
  const s = service.slug?.trim();
  return s || service._id;
}
