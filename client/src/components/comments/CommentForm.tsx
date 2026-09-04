import React, { useRef, useState } from 'react';
import { Send, Paperclip, X, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { commentsService } from '../../services/commentsService';
import { validateXHTML } from '../../utils/xhtmlValidator';
import { CaptchaWidget } from '../captcha/CaptchaWidget';
import { CommentToolbar } from './CommentToolbar';
import { CommentPreviewModal } from './CommentPreviewModal';
import type { Attachment, CreateCommentPayload } from '../../types';
import styles from './CommentForm.module.scss';

interface CommentFormProps {
  parentCommentId?: string;
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

  const [username, setUsername] = useState<string>(user?.name || user?.username || '');
  const [email, setEmail] = useState<string>(user?.email || '');
  const [homePage, setHomePage] = useState<string>(user?.home_page || user?.homePage || '');
  const [text, setText] = useState<string>('');

  const [captchaId, setCaptchaId] = useState<string>('');
  const [captchaCode, setCaptchaCode] = useState<string>('');

  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const [formError, setFormError] = useState<string>('');
  const [isPreviewOpen, setIsPreviewOpen] = useState<boolean>(false);

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const currentUserName = isAuthenticated ? (user?.name || user?.username || username) : username;
  const currentUserEmail = isAuthenticated ? user!.email : email;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const extension = file.name.split('.').pop()?.toLowerCase();

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

  const removeAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    const xhtmlCheck = validateXHTML(text);
    if (!xhtmlCheck.isValid) {
      setFormError(xhtmlCheck.error || 'Ошибка в XHTML тегах.');
      return;
    }

    if (!isAuthenticated && (!captchaId || !captchaCode)) {
      setFormError('Введите проверочный код с капчи.');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload: CreateCommentPayload = {
        userName: currentUserName,
        email: currentUserEmail,
        homePage: homePage || undefined,
        text,
        parentCommentId,
        captchaId: !isAuthenticated ? captchaId : undefined,
        captchaCode: !isAuthenticated ? captchaCode : undefined,
        attachmentIds: attachments.map((a) => a.id),
      };

      await commentsService.createComment(payload);

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
    <form className={`${styles.composer} ${parentCommentId ? styles.reply : ''}`} onSubmit={handleSubmit}>
      {parentCommentId && (
        <div className={styles.replyHeader}>
          <span>Ответ для <strong>{parentUsername || 'Пользователь'}</strong></span>
          {onCancel && (
            <button type="button" className={styles.closeReplyBtn} onClick={onCancel} title="Отменить ответ">
              <X size={15} />
            </button>
          )}
        </div>
      )}

      {formError && (
        <div className={styles.alert}>
          <AlertCircle size={15} />
          <span>{formError}</span>
        </div>
      )}

      {/* Guest Authorship Fields */}
      {!isAuthenticated && (
        <div className={styles.guestRow}>
          <input
            type="text"
            className={styles.guestInput}
            placeholder="Ваше имя *"
            value={currentUserName}
            onChange={(e) => setUsername(e.target.value)}
            required
            pattern="[a-zA-Z0-9]+"
            title="Только латинские буквы и цифры"
          />
          <input
            type="email"
            className={styles.guestInput}
            placeholder="E-mail *"
            value={currentUserEmail}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="url"
            className={styles.guestInput}
            placeholder="Сайт (опционально)"
            value={homePage}
            onChange={(e) => setHomePage(e.target.value)}
          />
        </div>
      )}

      {/* Textarea Area */}
      <div className={styles.editorBox}>
        <textarea
          ref={textareaRef}
          className={styles.textarea}
          rows={3}
          placeholder="Напишите комментарий... (поддерживаются теги: <i>, <strong>, <code>, <a href='...'>)"
          value={text}
          onChange={(e) => setText(e.target.value)}
          required
        />

        {/* Attachment Chips */}
        {attachments.length > 0 && (
          <div className={styles.attachedChips}>
            {attachments.map((att) => (
              <span key={att.id} className={styles.chip}>
                {att.fileType === 'image' ? '🖼️' : '📄'} {att.fileName}
                <button type="button" onClick={() => removeAttachment(att.id)}>
                  <X size={12} />
                </button>
              </span>
            ))}
          </div>
        )}

        {/* Action Bar Inside Box */}
        <div className={styles.bottomBar}>
          <div className={styles.bottomLeft}>
            <CommentToolbar
              textareaRef={textareaRef}
              text={text}
              setText={setText}
              onPreviewClick={() => setIsPreviewOpen(true)}
            />

            <label className={`${styles.attachBtn} ${isUploading ? styles.uploading : ''}`} title="Прикрепить изображение или TXT">
              <Paperclip size={15} />
              <input
                type="file"
                onChange={handleFileUpload}
                accept=".jpg,.jpeg,.png,.gif,.txt"
                style={{ display: 'none' }}
                disabled={isUploading}
              />
            </label>
          </div>

          <div className={styles.bottomRight}>
            {!isAuthenticated && (
              <CaptchaWidget
                captchaCode={captchaCode}
                onCaptchaChange={(id, code) => {
                  setCaptchaId(id);
                  setCaptchaCode(code);
                }}
              />
            )}

            <button
              type="submit"
              className={styles.submitBtn}
              disabled={isSubmitting || !text.trim()}
            >
              <Send size={14} />
              <span>{isSubmitting ? 'Отправка...' : 'Отправить'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Live Preview Modal */}
      <CommentPreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        username={currentUserName}
        email={currentUserEmail}
        text={text}
        attachments={attachments}
      />
    </form>
  );
};
