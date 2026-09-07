import React from 'react';
import { Italic, Bold, Code, Link2, Eye } from 'lucide-react';
import styles from './CommentToolbar.module.scss';

interface CommentToolbarProps {
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  text: string;
  setText: (text: string) => void;
  onPreviewClick: () => void;
}

export const CommentToolbar: React.FC<CommentToolbarProps> = ({
  textareaRef,
  text,
  setText,
  onPreviewClick,
}) => {
  const insertTag = (tag: string, attr: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = text.substring(start, end) || 'текст';

    const openTag = attr ? `<${tag} ${attr}>` : `<${tag}>`;
    const closeTag = `</${tag}>`;

    const replacement = `${openTag}${selectedText}${closeTag}`;
    const newText = text.substring(0, start) + replacement + text.substring(end);

    setText(newText);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + openTag.length,
        start + openTag.length + selectedText.length
      );
    }, 0);
  };

  const handleLinkTag = () => {
    const url = prompt('Введите URL ссылки:', 'https://example.com');
    if (!url) return;
    insertTag('a', `href="${url}" title="${url}"`);
  };

  return (
    <div className={styles.toolbar}>
      <div className={styles.actionsLeft}>
        <button
          type="button"
          className={styles.iconBtn}
          onClick={() => insertTag('strong')}
          title="Жирный текст (strong)"
        >
          <Bold size={15} />
        </button>
        <button
          type="button"
          className={styles.iconBtn}
          onClick={() => insertTag('i')}
          title="Курсив (i)"
        >
          <Italic size={15} />
        </button>
        <button
          type="button"
          className={styles.iconBtn}
          onClick={() => insertTag('code')}
          title="Фрагмент кода (code)"
        >
          <Code size={15} />
        </button>
        <button
          type="button"
          className={styles.iconBtn}
          onClick={handleLinkTag}
          title="Вставить ссылку (a)"
        >
          <Link2 size={15} />
        </button>
      </div>

      <button
        type="button"
        className={styles.previewBtn}
        onClick={onPreviewClick}
        title="Предпросмотр форматирования"
      >
        <Eye size={14} />
        <span>Превью</span>
      </button>
    </div>
  );
};
