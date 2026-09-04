import React, { useRef, useState } from 'react';
import { Send, Paperclip, X, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { commentsService } from '../../services/commentsService';
import { validateXHTML } from '../../utils/xhtmlValidator';
import { CaptchaWidget } from '../captcha/CaptchaWidget';
import { CommentToolbar } from './CommentToolbar';
import { CommentPreviewModal } from './CommentPreviewModal';
import type { Attachment, CreateCommentPayload } from '../../types';

interface CommentFormProps {
  parentCommentId?: number;
  parentUsername?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const CommentForm: React.FC<CommentFormProps> = ({
  parentCommentId,
  parentUsername,
  onSuccess,
  onCancel,
}) => {
  const { user, isAuthenticated } = useAuth();

  const [username, setUsername] = useState<string>(user?.username || '');
  const [email, setEmail] = useState<string>(user?.email || '');
  const [homePage, setHomePage] = useState<string>(user?.homePage || '');
  const [text, setText] = useState<string>('');

  const [captchaId, setCaptchaId] = useState<string>('');
  const [captchaCode, setCaptchaCode] = useState<string>('');

  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const [formError, setFormError] = useState<string>('');
  const [isPreviewOpen, setIsPreviewOpen] = useState<boolean>(false);

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const extension = file.name.split('.').pop()?.toLowerCase();

    // Client-side file checks
    if (!['jpg', 'jpeg', 'png', 'gif', 'txt'].includes(extension || '')) {
      setFormError('Недопустимый формат файла! Разрешены: JPG, PNG, GIF, TXT.');
      return;
    }

    if (extension === 'txt' && file.size > 100 * 1024) {
      setFormError('Размер файла TXT не должен превышать 100 КБ.');
      return;
    }

    setIsUploading(true);
    setFormError('');

    try {
      const uploaded = await commentsService.uploadAttachment(file);
      setAttachments((prev) => [...prev, uploaded]);
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'Ошибка загрузки файла.');
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const removeAttachment = (id: number) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    // Validate XHTML tags
    const xhtmlCheck = validateXHTML(text);
    if (!xhtmlCheck.isValid) {
      setFormError(xhtmlCheck.error || 'Ошибка в XHTML тегах.');
      return;
    }

    // Validate Guest Captcha
    if (!isAuthenticated && (!captchaId || !captchaCode)) {
      setFormError('Пожалуйста, введите код с капчи.');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload: CreateCommentPayload = {
        username: isAuthenticated ? user!.username : username,
        email: isAuthenticated ? user!.email : email,
        homePage: homePage || undefined,
        text,
        parentCommentId,
        captchaId: !isAuthenticated ? captchaId : undefined,
        captchaCode: !isAuthenticated ? captchaCode : undefined,
        attachmentIds: attachments.map((a) => a.id),
      };

      await commentsService.createComment(payload);

      // Reset form
      setText('');
      setCaptchaCode('');
      setAttachments([]);

      if (onSuccess) onSuccess();
    } catch (err: any) {
      const msg = err.response?.data?.message;
      setFormError(Array.isArray(msg) ? msg.join(', ') : msg || 'Ошибка отправки комментария.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className={`comment-form ${parentCommentId ? 'reply-form' : ''}`} onSubmit={handleSubmit}>
      {parentCommentId && (
        <div className="reply-header">
          <span>Ответ на комментарий от <strong>{parentUsername || 'Пользователь'}</strong></span>
          {onCancel && (
            <button type="button" className="cancel-reply-btn" onClick={onCancel}>
              <X size={16} /> Отмена
            </button>
          )}
        </div>
      )}

      {formError && (
        <div className="form-error-alert">
          <AlertCircle size={18} />
          <span>{formError}</span>
        </div>
      )}

      <div className="form-inputs-grid">
        <div className="form-group">
          <label className="field-label">
            Имя <span className="required">*</span>
          </label>
          <input
            type="text"
            className="input-field"
            placeholder="Иван Иванов"
            value={isAuthenticated ? user!.username : username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={isAuthenticated}
            required
          />
        </div>

        <div className="form-group">
          <label className="field-label">
            E-mail <span className="required">*</span>
          </label>
          <input
            type="email"
            className="input-field"
            placeholder="name@example.com"
            value={isAuthenticated ? user!.email : email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isAuthenticated}
            required
          />
        </div>

        <div className="form-group">
          <label className="field-label">Домашняя страница</label>
          <input
            type="url"
            className="input-field"
            placeholder="https://example.com"
            value={homePage}
            onChange={(e) => setHomePage(e.target.value)}
          />
        </div>
      </div>

      <div className="form-group text-group">
        <label className="field-label">
          Текст комментария <span className="required">*</span>
        </label>
        <CommentToolbar
          textareaRef={textareaRef}
          text={text}
          setText={setText}
          onPreviewClick={() => setIsPreviewOpen(true)}
        />
        <textarea
          ref={textareaRef}
          className="textarea-field"
          rows={4}
          placeholder="Напишите ваш комментарий... Разрешены теги: <i>, <strong>, <code>, <a href='...'>"
          value={text}
          onChange={(e) => setText(e.target.value)}
          required
        />
      </div>

      {/* Guest Captcha */}
      {!isAuthenticated && (
        <CaptchaWidget
          captchaCode={captchaCode}
          onCaptchaChange={(id, code) => {
            setCaptchaId(id);
            setCaptchaCode(code);
          }}
        />
      )}

      {/* File Attachment Dropzone & List */}
      <div className="attachments-section">
        <div className="attach-btn-wrapper">
          <label className={`btn btn-secondary attach-btn ${isUploading ? 'loading' : ''}`}>
            <Paperclip size={16} />
            <span>{isUploading ? 'Загрузка...' : 'Прикрепить файл'}</span>
            <input
              type="file"
              onChange={handleFileUpload}
              accept=".jpg,.jpeg,.png,.gif,.txt"
              style={{ display: 'none' }}
              disabled={isUploading}
            />
          </label>
          <span className="file-info-hint">Изображения (JPG, PNG, GIF) или TXT (&lt; 100 KB)</span>
        </div>

        {attachments.length > 0 && (
          <div className="attached-files-list">
            {attachments.map((att) => (
              <div key={att.id} className="attachment-badge">
                <span>{att.fileType === 'image' ? '🖼️' : '📄'} {att.fileName}</span>
                <button
                  type="button"
                  className="remove-attach-btn"
                  onClick={() => removeAttachment(att.id)}
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="form-actions">
        <button
          type="submit"
          className="btn btn-primary submit-btn"
          disabled={isSubmitting || !text.trim()}
        >
          <Send size={16} />
          <span>{isSubmitting ? 'Отправка...' : 'Опубликовать'}</span>
        </button>
      </div>

      {/* Live Preview Modal */}
      <CommentPreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        username={isAuthenticated ? user!.username : username}
        email={isAuthenticated ? user!.email : email}
        text={text}
        attachments={attachments}
      />
    </form>
  );
};
