import React, { useCallback, useEffect, useState } from 'react';
import { RefreshCw, ChevronLeft, ChevronRight, Bell } from 'lucide-react';
import { commentsService } from '../../services/commentsService';
import { useSocket } from '../../context/SocketContext';
import { CommentSortHeader } from './CommentSortHeader';
import { CommentItem } from './CommentItem';
import { CommentForm } from './CommentForm';
import { AttachmentViewer } from '../media/AttachmentViewer';
import type { Attachment, PaginatedCommentsResponse } from '../../types';
import styles from './CommentList.module.scss';

export const CommentList: React.FC = () => {
  const { newCommentNotification, clearNotification } = useSocket();

  const [commentsData, setCommentsData] = useState<PaginatedCommentsResponse | null>(null);
  const [page, setPage] = useState<number>(1);
  const [limit] = useState<number>(25);
  const [sortBy, setSortBy] = useState<'name' | 'email' | 'created_at'>('created_at');
  const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('DESC');

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeAttachment, setActiveAttachment] = useState<Attachment | null>(null);

  const fetchComments = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await commentsService.getComments({
        page,
        limit,
        sortBy,
        sortOrder,
      });
      setCommentsData(data);
    } catch (err) {
      console.error('Failed to fetch comments', err);
      setCommentsData({ data: [], total: 0, page: 1, limit: 25, totalPages: 0 });
    } finally {
      setIsLoading(false);
    }
  }, [page, limit, sortBy, sortOrder]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const handleSortChange = (
    newSortBy: 'name' | 'email' | 'created_at',
    newSortOrder: 'ASC' | 'DESC'
  ) => {
    setSortBy(newSortBy);
    setSortOrder(newSortOrder);
    setPage(1);
  };

  const handleRefreshNew = () => {
    clearNotification();
    fetchComments();
  };

  const commentsList = commentsData?.data ?? [];
  const totalComments = commentsData?.total ?? commentsData?.meta?.total ?? 0;
  const totalPages = commentsData?.totalPages ?? commentsData?.meta?.totalPages ?? 0;
  const notificationUsername =
    newCommentNotification?.user_name || newCommentNotification?.username || 'Пользователь';

  return (
    <div className={styles.section}>
      {/* Toast Notification Banner for Real-time WebSockets */}
      {newCommentNotification && (
        <div className={styles.toastBanner} onClick={handleRefreshNew}>
          <div className={styles.toastContent}>
            <Bell size={18} />
            <span>
              Поступил новый комментарий от <strong>{notificationUsername}</strong>!
            </span>
          </div>
          <button type="button" className={styles.refreshBtn}>
            <RefreshCw size={13} /> Обновить
          </button>
        </div>
      )}

      {/* Main Comment Form */}
      <div className={styles.mainComposer}>
        <CommentForm onSuccess={fetchComments} />
      </div>

      {/* Comments List & Sorting Bar */}
      <div className={styles.treeContainer}>
        <CommentSortHeader
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSortChange={handleSortChange}
          totalComments={totalComments}
        />

        {isLoading ? (
          <div className={styles.loadingSkeleton}>
            <div className={styles.skeletonCard} />
            <div className={styles.skeletonCard} />
            <div className={styles.skeletonCard} />
          </div>
        ) : commentsList.length === 0 ? (
          <div className={styles.emptyBox}>
            <p>Пока нет главных комментариев. Будьте первыми!</p>
          </div>
        ) : (
          <div className={styles.listStack}>
            {commentsList.map((comment) => (
              <CommentItem
                key={comment.id}
                comment={comment}
                onRefresh={fetchComments}
                onOpenAttachment={(att) => setActiveAttachment(att)}
              />
            ))}
          </div>
        )}

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className={styles.paginationBar}>
            <button
              type="button"
              className={styles.pageBtn}
              disabled={page === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              <ChevronLeft size={16} /> Назад
            </button>

            <div className={styles.pageNumbers}>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  type="button"
                  className={`${styles.pageNumBtn} ${p === page ? styles.active : ''}`}
                  onClick={() => setPage(p)}
                >
                  {p}
                </button>
              ))}
            </div>

            <button
              type="button"
              className={styles.pageBtn}
              disabled={page === totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              Вперёд <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>

      {/* Lightbox Attachment Modal */}
      <AttachmentViewer
        attachment={activeAttachment}
        onClose={() => setActiveAttachment(null)}
      />
    </div>
  );
};
