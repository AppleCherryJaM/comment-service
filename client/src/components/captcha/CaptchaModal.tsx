import React, { useEffect, useRef, useState } from 'react';
import { RefreshCw, ShieldCheck, AlertCircle } from 'lucide-react';
import { captchaService } from '../../services/captchaService';
import { ModalComponent } from '../common';
import styles from './CaptchaModal.module.scss';

interface CaptchaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (captchaId: string, captchaCode: string) => Promise<void>;
  isSubmitting: boolean;
}

export const CaptchaModal: React.FC<CaptchaModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  isSubmitting,
}) => {
  const [captchaId, setCaptchaId] = useState<string>('');
  const [captchaSvg, setCaptchaSvg] = useState<string>('');
  const [code, setCode] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const inputRef = useRef<HTMLInputElement | null>(null);

  const fetchCaptcha = async () => {
    setIsLoading(true);
    setError('');
    try {
      const data = await captchaService.getCaptcha();
      if (data && data.captchaSvg) {
        setCaptchaId(data.captchaId);
        setCaptchaSvg(data.captchaSvg);
      } else {
        setError('Не удалось получить код капчи с сервера.');
      }
    } catch {
      setError('Ошибка соединения при получении капчи.');
    } finally {
      setIsLoading(false);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  };

  useEffect(() => {
    if (isOpen) {
      setCode('');
      setError('');
      fetchCaptcha();
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) {
      setError('Введите проверочный код с картинки.');
      inputRef.current?.focus();
      return;
    }

    try {
      await onConfirm(captchaId, code.trim());
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Неверный код капчи.';
      setError(Array.isArray(msg) ? msg.join(', ') : msg);
      setCode('');
      fetchCaptcha();
    }
  };

  const modalTitle = (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
      <ShieldCheck size={18} style={{ color: '#3b82f6' }} />
      <span>Подтверждение отправки</span>
    </div>
  );

  return (
    <ModalComponent
      isOpen={isOpen}
      onClose={onClose}
      title={modalTitle}
      size="sm"
    >
      <form onSubmit={handleSubmit}>
        <p className={styles.subtitle}>
          Для защиты от спама, пожалуйста, введите символы с проверочной картинки:
        </p>

        {error && (
          <div className={styles.errorBanner} style={{ marginTop: '0.65rem' }}>
            <AlertCircle size={15} />
            <span>{error}</span>
          </div>
        )}

        <div className={styles.captchaCard}>
          <div className={styles.captchaPreviewRow}>
            {captchaSvg ? (
              <div
                className={styles.svgWrapper}
                dangerouslySetInnerHTML={{ __html: captchaSvg }}
                onClick={fetchCaptcha}
                title="Нажмите, чтобы обновить код"
              />
            ) : isLoading ? (
              <div className={styles.loadingPlaceholder}>Загрузка кода...</div>
            ) : (
              <div className={styles.errorPlaceholder}>Ошибка загрузки</div>
            )}

            <button
              type="button"
              className={`${styles.refreshBtn} ${isLoading ? styles.spinning : ''}`}
              onClick={fetchCaptcha}
              title="Обновить картинку"
              disabled={isLoading}
            >
              <RefreshCw size={15} />
            </button>
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="captcha-modal-input" className={styles.label}>
              Символы с картинки:
            </label>
            <input
              id="captcha-modal-input"
              ref={inputRef}
              type="text"
              className={`${styles.captchaInput} ${error ? styles.error : ''}`}
              placeholder="Код капчи"
              value={code}
              onChange={(e) => {
                setCode(e.target.value);
                if (error) setError('');
              }}
              maxLength={6}
              autoComplete="off"
              autoCapitalize="off"
              spellCheck="false"
              disabled={isSubmitting}
            />
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1.25rem' }}>
          <button
            type="button"
            className={styles.cancelBtn}
            onClick={onClose}
            disabled={isSubmitting}
          >
            Отмена
          </button>
          <button
            type="submit"
            className={styles.submitBtn}
            disabled={isSubmitting || !code.trim()}
          >
            {isSubmitting ? 'Отправка...' : 'Отправить'}
          </button>
        </div>
      </form>
    </ModalComponent>
  );
};
