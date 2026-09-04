import React, { useEffect, useState } from 'react';
import { RefreshCw, AlertCircle } from 'lucide-react';
import { captchaService } from '../../services/captchaService';

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
    <div className="captcha-inline-badge">
      <div className="captcha-svg-inline" onClick={fetchCaptcha} title="Нажмите для обновления">
        {captchaSvg ? (
          <div className="svg-box" dangerouslySetInnerHTML={{ __html: captchaSvg }} />
        ) : hasError ? (
          <span className="captcha-error-inline">
            <AlertCircle size={13} /> Ошибка
          </span>
        ) : (
          <span className="captcha-loading-inline">...</span>
        )}

        <button
          type="button"
          className={`captcha-reload-btn ${isLoading ? 'spinning' : ''}`}
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
        className={`captcha-input-compact ${error ? 'error' : ''}`}
        maxLength={6}
        required
      />
    </div>
  );
};
