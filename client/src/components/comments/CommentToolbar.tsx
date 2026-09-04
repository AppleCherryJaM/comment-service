import React from 'react';
import { Italic, Bold, Code, Link as LinkIcon, Eye } from 'lucide-react';

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
    <div className="comment-toolbar">
      <div className="toolbar-group">
        <button
          type="button"
          className="toolbar-btn"
          onClick={() => insertTag('i')}
          title="Курсив [<i>]"
        >
          <Italic size={15} /> <span>i</span>
        </button>
        <button
          type="button"
          className="toolbar-btn"
          onClick={() => insertTag('strong')}
          title="Жирный [<strong>]"
        >
          <Bold size={15} /> <span>strong</span>
        </button>
        <button
          type="button"
          className="toolbar-btn"
          onClick={() => insertTag('code')}
          title="Код [<code>]"
        >
          <Code size={15} /> <span>code</span>
        </button>
        <button
          type="button"
          className="toolbar-btn"
          onClick={handleLinkTag}
          title="Ссылка [<a href=...>]"
        >
          <LinkIcon size={15} /> <span>a</span>
        </button>
      </div>

      <button
        type="button"
        className="toolbar-btn preview-btn"
        onClick={onPreviewClick}
        title="Предпросмотр комментария"
      >
        <Eye size={15} /> <span>Предпросмотр</span>
      </button>
    </div>
  );
};
