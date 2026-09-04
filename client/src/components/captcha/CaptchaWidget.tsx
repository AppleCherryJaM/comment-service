import React, { useEffect, useState } from 'react';
import { RefreshCw } from 'lucide-react';
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

  const fetchCaptcha = async () => {
    setIsLoading(true);
    try {
      const data = await captchaService.getCaptcha();
      setCaptchaId(data.captchaId);
      setCaptchaSvg(data.captchaSvg);
      onCaptchaChange(data.captchaId, '');
    } catch (err) {
      console.error('Failed to fetch captcha', err);
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
    <div className="captcha-container">
      <label className="field-label">
        Капча <span className="required">*</span>
      </label>
      <div className="captcha-row">
        <div className="captcha-svg-wrapper" title="Нажмите, чтобы обновить капчу" onClick={fetchCaptcha}>
          {captchaSvg ? (
            <div dangerouslySetInnerHTML={{ __html: captchaSvg }} />
          ) : (
            <div className="captcha-placeholder">Загрузка...</div>
          )}
          <button
            type="button"
            className={`captcha-refresh-btn ${isLoading ? 'spinning' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              fetchCaptcha();
            }}
            title="Обновить капчу"
          >
            <RefreshCw size={16} />
          </button>
        </div>
        <input
          type="text"
          value={captchaCode}
          onChange={handleInputChange}
          placeholder="Введите символы"
          className={`input-field ${error ? 'input-error' : ''}`}
          maxLength={6}
          required
        />
      </div>
      {error && <span className="error-text">{error}</span>}
    </div>
  );
};
