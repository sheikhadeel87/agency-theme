export const CONTACT_SECTION_TITLE_MAX_LENGTH = 60;
export const CONTACT_SECTION_DESCRIPTION_MAX_LENGTH = 160;

export function validateContactSectionFields(
  title: string,
  description: string
): string | null {
  if (title.length > CONTACT_SECTION_TITLE_MAX_LENGTH) {
    return `Section heading must be at most ${CONTACT_SECTION_TITLE_MAX_LENGTH} characters (currently ${title.length}).`;
  }
  if (description.length > CONTACT_SECTION_DESCRIPTION_MAX_LENGTH) {
    return `Section description must be at most ${CONTACT_SECTION_DESCRIPTION_MAX_LENGTH} characters (currently ${description.length}).`;
  }
  return null;
}
