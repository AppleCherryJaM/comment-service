import React, { useState } from 'react';
import { Reply, Globe, MessageSquare, ChevronDown, ChevronUp, Image as ImageIcon, FileText } from 'lucide-react';
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

  const hasReplies = comment.replies && comment.replies.length > 0;
  const initialLetter = (comment.username || 'А').charAt(0).toUpperCase();

  return (
    <div className={`comment-card-wrapper depth-${Math.min(depth, 5)}`}>
      <div className="comment-card">
        <div className="comment-card-header">
          <div className="author-info-block">
            <div className="avatar-circle">{initialLetter}</div>
            <div className="author-details">
              <div className="author-name-row">
                <span className="author-name">{comment.username}</span>
                {comment.homePage && (
                  <a
                    href={comment.homePage}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="homepage-link"
                    title={comment.homePage}
                  >
                    <Globe size={13} />
                  </a>
                )}
              </div>
              <span className="author-email">{comment.email}</span>
            </div>
          </div>

          <div className="comment-meta">
            <span className="comment-date">{formatDate(comment.createdAt)}</span>
          </div>
        </div>

        {/* Comment Text Content */}
        <div
          className="comment-text-body"
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

        {/* Comment Actions Footer */}
        <div className="comment-card-footer">
          <button
            type="button"
            className="action-link reply-btn"
            onClick={() => setIsReplying(!isReplying)}
          >
            <Reply size={14} /> <span>Ответить</span>
          </button>

          {hasReplies && (
            <button
              type="button"
              className="action-link expand-btn"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              <MessageSquare size={14} />
              <span>
                {comment.replies!.length} {comment.replies!.length === 1 ? 'ответ' : 'ответов'}
              </span>
              {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
          )}
        </div>
      </div>

      {/* Inline Reply Form */}
      {isReplying && (
        <div className="inline-reply-container">
          <CommentForm
            parentCommentId={comment.id}
            parentUsername={comment.username}
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
