/** Homepage section title + intro (pricing, team, testimonials admin). */
export const SECTION_TITLE_DESCRIPTION_MAX_LENGTH = 100;

export function validateSectionTitleAndDescription(
  sectionTitle: string,
  sectionDescription: string
): string | null {
  if (sectionTitle.length > SECTION_TITLE_DESCRIPTION_MAX_LENGTH) {
    return `Section title must be at most ${SECTION_TITLE_DESCRIPTION_MAX_LENGTH} characters (currently ${sectionTitle.length}).`;
  }
  if (sectionDescription.length > SECTION_TITLE_DESCRIPTION_MAX_LENGTH) {
    return `Section description must be at most ${SECTION_TITLE_DESCRIPTION_MAX_LENGTH} characters (currently ${sectionDescription.length}).`;
  }
  return null;
}
