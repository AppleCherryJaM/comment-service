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
import styles from './CommentItem.module.scss';

interface CommentItemProps {
  comment: Comment;
  onRefresh: () => void;
  onOpenAttachment: (att: Attachment) => void;
  depth?: number;
  parentCommentText?: string;
}

// Generate consistent avatar color based on username
function getAvatarGradient(name: string): string {
  const gradients = [
    'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
    'linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)',
    'linear-gradient(135deg, #10B981 0%, #059669 100%)',
    'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
    'linear-gradient(135deg, #EC4899 0%, #DB2777 100%)',
    'linear-gradient(135deg, #06B6D4 0%, #0891B2 100%)',
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return gradients[Math.abs(hash) % gradients.length];
}

const extractPlainTextSnippet = (rawHtml?: string): string | null => {
  if (!rawHtml) return null;
  const cleanText = rawHtml.replace(/<[^>]*>/g, '').trim();
  if (!cleanText) return null;
  return cleanText.length > 85 ? `${cleanText.substring(0, 85)}...` : cleanText;
};

export const CommentItem: React.FC<CommentItemProps> = ({
  comment,
  onRefresh,
  onOpenAttachment,
  depth = 0,
  parentCommentText,
}) => {
  const [isReplying, setIsReplying] = useState<boolean>(false);
  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  const [votes, setVotes] = useState<number>(0);

  const hasReplies = comment.replies && comment.replies.length > 0;
  const username = comment.user?.name || comment.user?.username || comment.user_name || comment.username || 'Аноним';
  const homePage = comment.user?.home_page || comment.home_page || comment.homePage;
  const createdAt = comment.created_at || comment.createdAt || '';
  const initialLetter = username.charAt(0).toUpperCase();
  const avatarGradient = getAvatarGradient(username);

  const rawParentText = comment.parent_comment?.text || parentCommentText;
  const parentSnippet = comment.parent_comment_id ? extractPlainTextSnippet(rawParentText) : null;

  return (
    <div className={styles.commentNode}>
      <div className={styles.commentCard}>
        {/* Comment Header */}
        <div className={styles.topRow}>
          <div className={styles.authorMeta}>
            <div className={styles.avatar} style={{ background: avatarGradient }}>
              {initialLetter}
            </div>
            <div className={styles.identity}>
              <span className={styles.authorName}>{username}</span>
              <span className={styles.timestamp}>{formatDate(createdAt)}</span>
            </div>
          </div>

          <div className={styles.headerTools}>
            <button
              type="button"
              className={styles.toolBtn}
              title="Пермалинк"
              onClick={() => alert(`Ссылка на комментарий #${comment.id}`)}
            >
              <Hash size={14} />
            </button>
            <button type="button" className={styles.toolBtn} title="В закладки">
              <Bookmark size={14} />
            </button>
            <button
              type="button"
              className={`${styles.toolBtn} ${styles.replyTrigger} ${isReplying ? styles.active : ''}`}
              title="Ответить на комментарий"
              onClick={() => setIsReplying(!isReplying)}
            >
              <CornerUpLeft size={14} />
              <span>Ответить</span>
            </button>

            {homePage && (
              <a
                href={homePage}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.toolBtn}
                title={`Сайт: ${homePage}`}
              >
                <Info size={14} />
              </a>
            )}

            {hasReplies && (
              <button
                type="button"
                className={styles.toolBtn}
                title={isExpanded ? 'Свернуть ветку' : 'Развернуть ветку'}
                onClick={() => setIsExpanded(!isExpanded)}
              >
                {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                <span className={styles.repliesCount}>{comment.replies!.length}</span>
              </button>
            )}

            {/* Voting Pill */}
            <div className={styles.votePill}>
              <button
                type="button"
                className={styles.voteArrow}
                onClick={() => setVotes(votes + 1)}
                title="Нравится"
              >
                <ChevronUp size={13} />
              </button>
              <span className={`${styles.voteValue} ${votes > 0 ? styles.pos : votes < 0 ? styles.neg : ''}`}>
                {votes}
              </span>
              <button
                type="button"
                className={styles.voteArrow}
                onClick={() => setVotes(votes - 1)}
                title="Не нравится"
              >
                <ChevronDown size={13} />
              </button>
            </div>
          </div>
        </div>

        {/* Comment Content */}
        <div className={styles.bodyArea}>
          {parentSnippet && (
            <div className={styles.quoteBubble} title="Цитата">
              {parentSnippet}
            </div>
          )}

          <div
            className={styles.commentHtml}
            dangerouslySetInnerHTML={{ __html: comment.text }}
          />

          {/* Attachments */}
          {comment.attachments && comment.attachments.length > 0 && (
            <div className={styles.mediaGrid}>
              {comment.attachments.map((att) => (
                <div
                  key={att.id}
                  className={styles.mediaThumbChip}
                  onClick={() => onOpenAttachment(att)}
                  title={att.fileName}
                >
                  {att.fileType === 'image' ? (
                    <div className={styles.imageBox}>
                      <img src={att.fileUrl} alt={att.fileName} />
                      <span className={styles.overlay}>
                        <ImageIcon size={11} /> {(att.fileSize / 1024).toFixed(0)} KB
                      </span>
                    </div>
                  ) : (
                    <div className={styles.textChip}>
                      <FileText size={15} />
                      <span>{att.fileName}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Inline Reply Composer */}
      {isReplying && (
        <div className={styles.inlineReplyWrapper}>
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

      {/* Nested Replies */}
      {hasReplies && isExpanded && (
        <div className={styles.subtree}>
          {comment.replies!.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              onRefresh={onRefresh}
              onOpenAttachment={onOpenAttachment}
              depth={depth + 1}
              parentCommentText={comment.text}
            />
          ))}
        </div>
      )}
    </div>
  );
};
