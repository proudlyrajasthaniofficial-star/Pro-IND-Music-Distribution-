import createDOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';

const window = new JSDOM('').window;
// @ts-ignore
const DOMPurify = createDOMPurify(window);

/**
 * Sanitizes HTML to prevent XSS attacks.
 * @param html The raw HTML string to sanitize.
 * @returns A safe HTML string.
 */
export const sanitizeHTML = (html: string): string => {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'span', 'div'],
    ALLOWED_ATTR: ['href', 'target', 'rel', 'class', 'id', 'style'],
  });
};

/**
 * Escapes common HTML characters to prevent injection.
 * @param str The string to escape.
 * @returns An escaped string.
 */
export const escapeHTML = (str: string): string => {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

/**
 * Validates if a string is a valid email.
 */
export const isValidEmail = (email: string): boolean => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

/**
 * Validates if a string is a valid alphanumeric slug.
 */
export const isValidSlug = (slug: string): boolean => {
  return /^[a-z0-9-]+$/.test(slug);
};
