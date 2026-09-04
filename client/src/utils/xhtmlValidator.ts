const ALLOWED_TAGS = new Set(['a', 'i', 'strong', 'code']);

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Validates XHTML tag balance and syntax for allowed tags: <a>, <i>, <strong>, <code>.
 */
export function validateXHTML(input: string): ValidationResult {
  if (!input || !input.trim()) {
    return { isValid: true };
  }

  // Regex to match HTML tags: <tag>, </tag>, <tag attr="val">
  const tagRegex = /<\/?([a-zA-Z0-9]+)(?:\s+[^>]*?)?>/g;
  const tagStack: { tag: string; raw: string }[] = [];

  let match: RegExpExecArray | null;

  while ((match = tagRegex.exec(input)) !== null) {
    const fullTag = match[0];
    const tagName = match[1].toLowerCase();
    const isClosing = fullTag.startsWith('</');

    if (!ALLOWED_TAGS.has(tagName)) {
      return {
        isValid: false,
        error: `Недопустимый тег <${tagName}>. Разрешены только: <a>, <i>, <strong>, <code>.`,
      };
    }

    if (tagName === 'a' && !isClosing) {
      // Ensure <a> has href attribute
      if (!/\bhref\s*=\s*["'][^"']+["']/i.test(fullTag)) {
        return {
          isValid: false,
          error: 'Тег <a> должен содержать атрибут href (например: <a href="http://example.com" title="...">).',
        };
      }
    }

    if (isClosing) {
      if (tagStack.length === 0) {
        return {
          isValid: false,
          error: `Обнаружен закрывающий тег </${tagName}> без соответствующего открывающего тега.`,
        };
      }

      const lastOpened = tagStack.pop();
      if (lastOpened?.tag !== tagName) {
        return {
          isValid: false,
          error: `Ошибка вложенности тегов: ожидал закрытия </${lastOpened?.tag}>, но встретил </${tagName}>.`,
        };
      }
    } else {
      tagStack.push({ tag: tagName, raw: fullTag });
    }
  }

  if (tagStack.length > 0) {
    const unclosed = tagStack[tagStack.length - 1];
    return {
      isValid: false,
      error: `Незакрытый тег <${unclosed.tag}>. Не забудьте закрыть его: </${unclosed.tag}>.`,
    };
  }

  return { isValid: true };
}
