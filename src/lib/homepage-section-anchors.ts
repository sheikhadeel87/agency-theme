/**
 * Homepage section `id`s and matching hash links (`/#…`).
 * Keep in sync with the corresponding `<section id="…">` on `/`.
 */

export const HOMEPAGE_BLOG_SECTION_ID = "blog" as const;
export const HOMEPAGE_BLOG_SECTION_HREF = `/#${HOMEPAGE_BLOG_SECTION_ID}` as const;

export const HOMEPAGE_TEAM_SECTION_ID = "team" as const;
export const HOMEPAGE_TEAM_SECTION_HREF = `/#${HOMEPAGE_TEAM_SECTION_ID}` as const;

export const HOMEPAGE_PORTFOLIO_SECTION_ID = "portfolio" as const;
export const HOMEPAGE_PORTFOLIO_SECTION_HREF =
  `/#${HOMEPAGE_PORTFOLIO_SECTION_ID}` as const;
