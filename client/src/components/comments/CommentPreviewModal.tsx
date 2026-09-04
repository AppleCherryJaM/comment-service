import React from 'react';
import { X, CheckCircle, AlertTriangle } from 'lucide-react';
import { validateXHTML } from '../../utils/xhtmlValidator';
import type { Attachment } from '../../types';

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
  if (!isOpen) return null;

  const validation = validateXHTML(text);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content preview-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Предпросмотр комментария</h3>
          <button type="button" className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          {!validation.isValid ? (
            <div className="validation-alert error">
              <AlertTriangle size={18} />
              <span>{validation.error}</span>
            </div>
          ) : (
            <div className="validation-alert success">
              <CheckCircle size={18} />
              <span>Синтаксис XHTML-тегов верен!</span>
            </div>
          )}

          <div className="comment-preview-card">
            <div className="preview-author-bar">
              <div className="avatar-placeholder">
                {(username || 'А').charAt(0).toUpperCase()}
              </div>
              <div className="author-meta">
                <span className="author-name">{username || 'Имя пользователя'}</span>
                <span className="author-email">{email || 'user@example.com'}</span>
              </div>
              <span className="preview-badge">Только что</span>
            </div>

            <div
              className="comment-text-content"
              dangerouslySetInnerHTML={{ __html: text || '<i>Текст комментария пуст...</i>' }}
            />

            {attachments.length > 0 && (
              <div className="attachments-preview-list">
                <h4>Вложения ({attachments.length}):</h4>
                <div className="attachments-grid">
                  {attachments.map((att) => (
                    <div key={att.id} className="attachment-chip">
                      {att.fileType === 'image' ? '🖼️' : '📄'} {att.fileName}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="modal-footer">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Закрыть
          </button>
        </div>
      </div>
    </div>
  );
};
