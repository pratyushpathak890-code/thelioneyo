/**
 * Slug generation utilities for THE LIONEYO product URLs
 */

/**
 * Generate a URL-safe slug from a product title
 * e.g. "IIT Patna Legacy Tee" → "iit-patna-legacy-tee"
 */
export function generateSlug(title) {
  return (title || '')
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')   // remove special chars
    .replace(/\s+/g, '-')       // spaces → hyphens
    .replace(/-+/g, '-')        // collapse multiple hyphens
    .replace(/^-+|-+$/g, '');   // trim leading/trailing hyphens
}

/**
 * Ensure slug is unique against a list of existing slugs.
 * Appends -2, -3 etc. if collision found.
 */
export function makeUniqueSlug(base, existingSlugs = [], excludeId = null) {
  const lowerBase = base.toLowerCase();
  if (!existingSlugs.map(s => s.toLowerCase()).includes(lowerBase)) return lowerBase;
  let i = 2;
  while (existingSlugs.map(s => s.toLowerCase()).includes(`${lowerBase}-${i}`)) i++;
  return `${lowerBase}-${i}`;
}
