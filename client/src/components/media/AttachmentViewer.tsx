import React, { useEffect, useState } from 'react';
import { Download } from 'lucide-react';
import { ModalComponent } from '../common';
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

  const isImage = attachment.fileType === 'image';

  const title = (
    <span>
      {isImage ? '🖼️ ' : '📄 '}
      {attachment.fileName} ({(attachment.fileSize / 1024).toFixed(1)} KB)
    </span>
  );

  const headerExtra = (
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
  );

  return (
    <ModalComponent
      isOpen={!!attachment}
      onClose={onClose}
      title={title}
      headerExtra={headerExtra}
      size={isImage ? 'xl' : 'lg'}
      theme={isImage ? 'dark' : 'light'}
    >
      {isImage ? (
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
    </ModalComponent>
  );
};
