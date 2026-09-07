import React from 'react';
import { CheckCircle, AlertTriangle } from 'lucide-react';
import { validateXHTML } from '../../utils/xhtmlValidator';
import { ModalComponent } from '../common';
import type { Attachment } from '../../types';
import styles from './CommentPreviewModal.module.scss';

interface CommentPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  username: string;
  email: string;
  text: string;
  attachments?: Attachment[];
}

export const CommentPreviewModal: React.FC<CommentPreviewModalProps> = ({
  isOpen,
  onClose,
  username,
  email,
  text,
  attachments = [],
}) => {
  const validation = validateXHTML(text);

  const footer = (
    <button type="button" className={styles.closeBtnSecondary} onClick={onClose}>
      Закрыть
    </button>
  );

  return (
    <ModalComponent
      isOpen={isOpen}
      onClose={onClose}
      title="Предпросмотр комментария"
      size="lg"
      footer={footer}
    >
      {!validation.isValid ? (
        <div className={`${styles.alert} ${styles.error}`}>
          <AlertTriangle size={18} />
          <span>{validation.error}</span>
        </div>
      ) : (
        <div className={`${styles.alert} ${styles.success}`}>
          <CheckCircle size={18} />
          <span>Синтаксис XHTML-тегов верен!</span>
        </div>
      )}

      <div className={styles.previewCard}>
        <div className={styles.authorBar}>
          <div className={styles.avatar}>
            {(username || 'А').charAt(0).toUpperCase()}
          </div>
          <div className={styles.meta}>
            <span className={styles.name}>{username || 'Имя пользователя'}</span>
            <span className={styles.email}>{email || 'user@example.com'}</span>
          </div>
          <span className={styles.badge}>Только что</span>
        </div>

        <div
          className={styles.textContent}
          dangerouslySetInnerHTML={{ __html: text || '<i>Текст комментария пуст...</i>' }}
        />

        {attachments.length > 0 && (
          <div className={styles.attachmentsList}>
            <h4>Вложения ({attachments.length}):</h4>
            <div className={styles.attachmentsGrid}>
              {attachments.map((att) => (
                <div key={att.id} className={styles.attachmentChip}>
                  {att.fileType === 'image' ? '🖼️' : '📄'} {att.fileName}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </ModalComponent>
  );
};
