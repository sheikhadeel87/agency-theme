export const HERO_HEADING_MAX_LENGTH = 60;
export const HERO_DESCRIPTION_MAX_LENGTH = 100;

export function validateHeroHeadingAndDescription(
  heading: string,
  description: string
): string | null {
  if (heading.length > HERO_HEADING_MAX_LENGTH) {
    return `Heading must be at most ${HERO_HEADING_MAX_LENGTH} characters (currently ${heading.length}).`;
  }
  if (description.length > HERO_DESCRIPTION_MAX_LENGTH) {
    return `Description must be at most ${HERO_DESCRIPTION_MAX_LENGTH} characters (currently ${description.length}).`;
  }
  return null;
}
