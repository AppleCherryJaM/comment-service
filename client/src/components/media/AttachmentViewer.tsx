import React, { useEffect, useState } from 'react';
import { X, Download } from 'lucide-react';
import type { Attachment } from '../../types';

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
    <div className="modal-backdrop lightbox-backdrop" onClick={onClose}>
      <div
        className={`modal-content ${attachment.fileType === 'image' ? 'lightbox-content' : 'text-viewer-content'}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <span className="attachment-title">
            {attachment.fileType === 'image' ? '🖼️ ' : '📄 '}
            {attachment.fileName} ({(attachment.fileSize / 1024).toFixed(1)} KB)
          </span>
          <div className="header-actions">
            <a
              href={attachment.fileUrl}
              download={attachment.fileName}
              target="_blank"
              rel="noopener noreferrer"
              className="action-btn"
              title="Скачать файл"
            >
              <Download size={18} />
            </a>
            <button type="button" className="close-btn" onClick={onClose}>
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="modal-body">
          {attachment.fileType === 'image' ? (
            <div className="lightbox-image-wrapper">
              <img src={attachment.fileUrl} alt={attachment.fileName} className="lightbox-image" />
            </div>
          ) : (
            <div className="text-file-viewer">
              {isLoadingText ? (
                <div className="spinner-loading">Загрузка текста...</div>
              ) : (
                <pre className="text-code-block">{textContent}</pre>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
