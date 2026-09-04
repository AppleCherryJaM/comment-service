import React, { useState } from 'react';
import { X, LogIn, UserPlus, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { login, register } = useAuth();
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');

  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [homePage, setHomePage] = useState<string>('');

  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (activeTab === 'login') {
        await login({ email, password });
      } else {
        await register({ name, email, password, home_page: homePage || undefined });
      }
      onClose();
    } catch (err: any) {
      const msg = err.response?.data?.message;
      setError(Array.isArray(msg) ? msg.join(', ') : msg || 'Ошибка авторизации');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content auth-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="auth-tabs">
            <button
              type="button"
              className={`auth-tab ${activeTab === 'login' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('login');
                setError('');
              }}
            >
              <LogIn size={16} /> Вход
            </button>
            <button
              type="button"
              className={`auth-tab ${activeTab === 'register' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('register');
                setError('');
              }}
            >
              <UserPlus size={16} /> Регистрация
            </button>
          </div>
          <button type="button" className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="modal-body">
            {error && (
              <div className="form-error-alert">
                <AlertCircle size={18} />
                <span>{error}</span>
              </div>
            )}

            {activeTab === 'register' && (
              <div className="form-group">
                <label className="field-label">
                  Имя пользователя <span className="required">*</span>
                </label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="ИванИванов (только латиница и цифры)"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  pattern="[a-zA-Z0-9]+"
                  title="Только латинские буквы и цифры"
                />
              </div>
            )}

            <div className="form-group">
              <label className="field-label">
                E-mail <span className="required">*</span>
              </label>
              <input
                type="email"
                className="input-field"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="field-label">
                Пароль <span className="required">*</span>
              </label>
              <input
                type="password"
                className="input-field"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>

            {activeTab === 'register' && (
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
            )}
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Отмена
            </button>
            <button type="submit" className="btn btn-primary" disabled={isLoading}>
              {isLoading ? 'Загрузка...' : activeTab === 'login' ? 'Войти' : 'Зарегистрироваться'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
