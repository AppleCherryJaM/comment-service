import { BadRequestException } from '@nestjs/common';

const ALLOWED_TAGS = ['a', 'code', 'i', 'strong'];

/**
 * Validates XHTML tag closure and ensures only allowed tags and attributes exist.
 */
export function validateAndSanitizeXHTML(text: string): string {
  if (!text || typeof text !== 'string') {
    throw new BadRequestException('Text is required');
  }

  // Check for unallowed HTML tags
  const allTags = text.match(/<\/?([a-zA-Z0-9]+)[^>]*>/g) || [];
  const tagStack: string[] = [];

  for (const tagStr of allTags) {
    const isClosing = tagStr.startsWith('</');
    const tagNameMatch = tagStr.match(/<\/?([a-zA-Z0-9]+)/);

    if (!tagNameMatch) {
      throw new BadRequestException('Malformed HTML tag in text');
    }

    const tagName = tagNameMatch[1].toLowerCase();

    if (!ALLOWED_TAGS.includes(tagName)) {
      throw new BadRequestException(
        `Disallowed HTML tag <${tagName}>. Only <a>, <code>, <i>, <strong> are permitted.`,
      );
    }

    // Check allowed attributes on <a> tag
    if (tagName === 'a' && !isClosing) {
      // Ensure only href and title attributes are allowed
      const attrMatches = tagStr.match(/\s+([a-zA-Z0-9_-]+)=/g) || [];
      for (const attr of attrMatches) {
        const attrName = attr.replace(/[\s=]/g, '').toLowerCase();
        if (attrName !== 'href' && attrName !== 'title') {
          throw new BadRequestException(
            `Disallowed attribute '${attrName}' on <a> tag. Only 'href' and 'title' are allowed.`,
          );
        }
      }
    }

    if (isClosing) {
      if (tagStack.length === 0 || tagStack[tagStack.length - 1] !== tagName) {
        throw new BadRequestException(
          `Mismatched or unclosed XHTML tag: </${tagName}>`,
        );
      }
      tagStack.pop();
    } else {
      tagStack.push(tagName);
    }
  }

  if (tagStack.length > 0) {
    throw new BadRequestException(
      `Unclosed XHTML tag(s): <${tagStack.join('>, <')}>`,
    );
  }

  return text;
}
