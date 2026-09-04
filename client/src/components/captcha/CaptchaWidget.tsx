import React, { useEffect, useState } from 'react';
import { RefreshCw, AlertCircle } from 'lucide-react';
import { captchaService } from '../../services/captchaService';
import styles from './CaptchaWidget.module.scss';

interface CaptchaWidgetProps {
  captchaCode: string;
  onCaptchaChange: (captchaId: string, captchaCode: string) => void;
  error?: string;
}

export const CaptchaWidget: React.FC<CaptchaWidgetProps> = ({
  captchaCode,
  onCaptchaChange,
  error,
}) => {
  const [captchaId, setCaptchaId] = useState<string>('');
  const [captchaSvg, setCaptchaSvg] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [hasError, setHasError] = useState<boolean>(false);

  const fetchCaptcha = async () => {
    setIsLoading(true);
    setHasError(false);
    try {
      const data = await captchaService.getCaptcha();
      if (data && data.captchaSvg) {
        setCaptchaId(data.captchaId);
        setCaptchaSvg(data.captchaSvg);
        onCaptchaChange(data.captchaId, '');
      } else {
        setHasError(true);
      }
    } catch (err) {
      console.error('Failed to fetch captcha', err);
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCaptcha();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    onCaptchaChange(captchaId, value);
  };

  return (
    <div className={styles.badge}>
      <div className={styles.svgInline} onClick={fetchCaptcha} title="Нажмите для обновления">
        {captchaSvg ? (
          <div className={styles.svgBox} dangerouslySetInnerHTML={{ __html: captchaSvg }} />
        ) : hasError ? (
          <span className={styles.errorInline}>
            <AlertCircle size={13} /> Ошибка
          </span>
        ) : (
          <span className={styles.loadingInline}>...</span>
        )}

        <button
          type="button"
          className={`${styles.reloadBtn} ${isLoading ? styles.spinning : ''}`}
          onClick={(e) => {
            e.stopPropagation();
            fetchCaptcha();
          }}
          title="Сменить капчу"
        >
          <RefreshCw size={13} />
        </button>
      </div>

      <input
        type="text"
        value={captchaCode}
        onChange={handleInputChange}
        placeholder="Код"
        className={`${styles.input} ${error ? styles.hasError : ''}`}
        maxLength={6}
        required
      />
    </div>
  );
};
