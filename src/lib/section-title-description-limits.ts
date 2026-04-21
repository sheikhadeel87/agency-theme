/** Homepage section title + intro (pricing, team, testimonials admin). */
export const SECTION_TITLE_DESCRIPTION_MAX_LENGTH = 100;

export function validateMaxLength(
  fieldLabel: string,
  value: string,
  maxLength: number = SECTION_TITLE_DESCRIPTION_MAX_LENGTH
): string | null {
  if (value.length > maxLength) {
    return `${fieldLabel} must be at most ${maxLength} characters (currently ${value.length}).`;
  }
  return null;
}

export function validateSectionTitleAndDescription(
  sectionTitle: string,
  sectionDescription: string
): string | null {
  return (
    validateMaxLength("Section title", sectionTitle) ??
    validateMaxLength("Section description", sectionDescription)
  );
}
