/**
 * Input sanitization utilities for ad posting.
 * Defense-in-depth against XSS/injection — React auto-escapes JSX,
 * but we sanitize on write to prevent stored XSS in non-React contexts.
 */

/**
 * Strip all HTML tags from a string, including encoded variants.
 */
function stripHtmlTags(input: string): string {
  return input
    .replace(/<[^>]*>?/gm, '')    // Remove HTML tags
    .replace(/&lt;/g, '<')         // Decode common entities
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/<[^>]*>?/gm, '')    // Second pass after entity decode
    .trim();
}

/**
 * Sanitize a text input field for safe storage.
 * Strips HTML, javascript: protocols, on* event handlers, and normalizes whitespace.
 */
export function sanitizeTextInput(input: string): string {
  let sanitized = stripHtmlTags(input);

  // Remove javascript: protocol patterns
  sanitized = sanitized.replace(/javascript\s*:/gi, '');

  // Remove on* event handler patterns (onclick, onerror, etc.)
  sanitized = sanitized.replace(/\bon\w+\s*=/gi, '');

  // Remove data: URI patterns (except harmless image types)
  sanitized = sanitized.replace(/data\s*:\s*(?!image\/(?:png|jpeg|webp|gif))/gi, 'data_blocked:');

  // Normalize excessive whitespace (preserve single newlines for descriptions)
  sanitized = sanitized.replace(/[ \t]+/g, ' ');
  sanitized = sanitized.replace(/\n{3,}/g, '\n\n');

  return sanitized.trim();
}

/**
 * Sanitize all text fields in an ad submission.
 */
export function sanitizeAdFields(fields: {
  title: string;
  description: string;
  location: string;
  contact: string;
  category?: string;
  subcategory?: string;
  section?: string;
}) {
  return {
    title: sanitizeTextInput(fields.title),
    description: sanitizeTextInput(fields.description),
    location: sanitizeTextInput(fields.location),
    contact: sanitizeTextInput(fields.contact),
    category: fields.category ? sanitizeTextInput(fields.category) : undefined,
    subcategory: fields.subcategory ? sanitizeTextInput(fields.subcategory) : undefined,
    section: fields.section ? sanitizeTextInput(fields.section) : undefined,
  };
}
