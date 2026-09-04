import React, { useEffect, useState } from 'react';
import { X, Download } from 'lucide-react';
import type { Attachment } from '../../types';
import styles from './AttachmentViewer.module.scss';

interface AttachmentViewerProps {
  attachment: Attachment | null;
  onClose: () => void;
}

export const AttachmentViewer: React.FC<AttachmentViewerProps> = ({
  attachment,
  onClose,
}) => {
  const [textContent, setTextContent] = useState<string>('');
  const [isLoadingText, setIsLoadingText] = useState<boolean>(false);

  useEffect(() => {
    if (attachment && attachment.fileType === 'text') {
      setIsLoadingText(true);
      fetch(attachment.fileUrl)
        .then((res) => res.text())
        .then((data) => setTextContent(data))
        .catch(() => setTextContent('Не удалось загрузить содержимое файла.'))
        .finally(() => setIsLoadingText(false));
    }
  }, [attachment]);

  if (!attachment) return null;

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div
        className={`${styles.modal} ${attachment.fileType === 'image' ? styles.imageModal : ''}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.header}>
          <span className={styles.title}>
            {attachment.fileType === 'image' ? '🖼️ ' : '📄 '}
            {attachment.fileName} ({(attachment.fileSize / 1024).toFixed(1)} KB)
          </span>
          <div className={styles.actions}>
            <a
              href={attachment.fileUrl}
              download={attachment.fileName}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.actionBtn}
              title="Скачать файл"
            >
              <Download size={18} />
            </a>
            <button type="button" className={styles.closeBtn} onClick={onClose}>
              <X size={20} />
            </button>
          </div>
        </div>

        <div className={styles.body}>
          {attachment.fileType === 'image' ? (
            <div className={styles.imageWrapper}>
              <img src={attachment.fileUrl} alt={attachment.fileName} className={styles.image} />
            </div>
          ) : (
            <div className={styles.textViewer}>
              {isLoadingText ? (
                <div className={styles.loading}>Загрузка текста...</div>
              ) : (
                <pre className={styles.codeBlock}>{textContent}</pre>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
