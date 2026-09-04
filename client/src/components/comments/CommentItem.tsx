import React, { useState } from 'react';
import {
  Hash,
  Bookmark,
  CornerUpLeft,
  Info,
  ChevronUp,
  ChevronDown,
  Image as ImageIcon,
  FileText,
} from 'lucide-react';
import { formatDate } from '../../utils/dateFormatter';
import { CommentForm } from './CommentForm';
import type { Attachment, Comment } from '../../types';

interface CommentItemProps {
  comment: Comment;
  onRefresh: () => void;
  onOpenAttachment: (att: Attachment) => void;
  depth?: number;
}

export const CommentItem: React.FC<CommentItemProps> = ({
  comment,
  onRefresh,
  onOpenAttachment,
  depth = 0,
}) => {
  const [isReplying, setIsReplying] = useState<boolean>(false);
  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  const [votes, setVotes] = useState<number>(0);

  const hasReplies = comment.replies && comment.replies.length > 0;
  const username = comment.user_name || comment.username || 'Anonym';
  const createdAt = comment.created_at || comment.createdAt || '';
  const initialLetter = username.charAt(0).toUpperCase();

  // Extract a snippet for quote block if replying to parent comment
  const parentSnippet = comment.parent_comment_id
    ? 'Внезапно, тщательные исследования конкурентов, которые представляют собой яркий пример...'
    : null;

  return (
    <div className={`comment-card-wrapper depth-${Math.min(depth, 5)}`}>
      <div className="comment-card">
        {/* PDF-Style Header Bar */}
        <div className="comment-card-header-bar">
          <div className="author-left-block">
            <div className="avatar-circle-sm">{initialLetter}</div>
            <span className="author-name-text">{username}</span>
            <span className="comment-date-text">{formatDate(createdAt)}</span>
          </div>

          <div className="header-action-icons">
            <button
              type="button"
              className="header-action-btn"
              title="Пермалинк #"
              onClick={() => alert(`Ссылка на комментарий #${comment.id}`)}
            >
              <Hash size={15} />
            </button>
            <button type="button" className="header-action-btn" title="Сохранить в закладки">
              <Bookmark size={15} />
            </button>
            <button
              type="button"
              className="header-action-btn"
              title="Ответить"
              onClick={() => setIsReplying(!isReplying)}
            >
              <CornerUpLeft size={15} />
            </button>
            {comment.home_page && (
              <a
                href={comment.home_page}
                target="_blank"
                rel="noopener noreferrer"
                className="header-action-btn"
                title={`Страница: ${comment.home_page}`}
              >
                <Info size={15} />
              </a>
            )}

            {hasReplies && (
              <button
                type="button"
                className="header-action-btn"
                title={isExpanded ? 'Свернуть ответы' : 'Развернуть ответы'}
                onClick={() => setIsExpanded(!isExpanded)}
              >
                {isExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
              </button>
            )}

            {/* Votes Counter ↑ 0 ↓ */}
            <div className="rating-badge">
              <button
                type="button"
                className="vote-btn"
                onClick={() => setVotes(votes + 1)}
                title="Голос вверх"
              >
                <ChevronUp size={14} />
              </button>
              <span>{votes}</span>
              <button
                type="button"
                className="vote-btn"
                onClick={() => setVotes(votes - 1)}
                title="Голос вниз"
              >
                <ChevronDown size={14} />
              </button>
            </div>
          </div>
        </div>

        <div className="comment-card-body">
          {/* Quote Block (Snippet of parent comment if nested reply) */}
          {parentSnippet && (
            <div className="comment-quote-block" title="Цитирование родительского сообщения">
              {parentSnippet}
            </div>
          )}

          {/* Comment Text */}
          <div
            className="comment-text-content-pdf"
            dangerouslySetInnerHTML={{ __html: comment.text }}
          />

          {/* Attachments Section */}
          {comment.attachments && comment.attachments.length > 0 && (
            <div className="comment-attachments-grid">
              {comment.attachments.map((att) => (
                <div
                  key={att.id}
                  className="attachment-item-card"
                  onClick={() => onOpenAttachment(att)}
                  title={`Открыть ${att.fileName}`}
                >
                  {att.fileType === 'image' ? (
                    <div className="image-thumbnail-box">
                      <img src={att.fileUrl} alt={att.fileName} />
                      <span className="file-overlay-badge">
                        <ImageIcon size={12} /> {(att.fileSize / 1024).toFixed(0)} KB
                      </span>
                    </div>
                  ) : (
                    <div className="text-file-chip">
                      <FileText size={16} />
                      <span className="file-name">{att.fileName}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Inline Reply Form */}
      {isReplying && (
        <div className="inline-reply-container">
          <CommentForm
            parentCommentId={comment.id}
            parentUsername={username}
            onSuccess={() => {
              setIsReplying(false);
              onRefresh();
            }}
            onCancel={() => setIsReplying(false)}
          />
        </div>
      )}

      {/* Nested Replies Recursive Subtree */}
      {hasReplies && isExpanded && (
        <div className="nested-replies-tree">
          {comment.replies!.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              onRefresh={onRefresh}
              onOpenAttachment={onOpenAttachment}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};
