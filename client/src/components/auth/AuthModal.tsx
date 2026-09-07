import React, { useState } from 'react';
import {
  LogIn,
  UserPlus,
  AlertCircle,
  Mail,
  Lock,
  User as UserIcon,
  Globe,
  Eye,
  EyeOff,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { ModalComponent } from '../common';
import styles from './AuthModal.module.scss';

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

  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

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

  const toggleTab = (tab: 'login' | 'register') => {
    setActiveTab(tab);
    setError('');
  };

  return (
    <ModalComponent
      isOpen={isOpen}
      onClose={onClose}
      size="md"
    >
      <div className={styles.authCard}>
        {/* Brand Header */}
        <div className={styles.brandHeader}>
          <img
            src="/cta_logo_badge_dark.svg"
            alt="CTA Logo"
            className={styles.brandLogo}
          />
          <h2 className={styles.title}>
            {activeTab === 'login' ? 'Добро пожаловать' : 'Создание профиля'}
          </h2>
          <p className={styles.subtitle}>
            {activeTab === 'login'
              ? 'Войдите в систему для доступа ко всем возможностям'
              : 'Присоединяйтесь к дискуссии и настройте свой профиль'}
          </p>
        </div>

        {/* Value Proposition Badge */}
        <div className={styles.benefitBadge}>
          <Sparkles size={13} />
          <span>Авторизованные пользователи комментируют без капчи</span>
        </div>

        {/* Modern Segmented Pill Control */}
        <div className={styles.segmentedControl}>
          <button
            type="button"
            className={`${styles.segmentedTab} ${activeTab === 'login' ? styles.active : ''}`}
            onClick={() => toggleTab('login')}
          >
            <LogIn size={15} /> <span>Вход</span>
          </button>
          <button
            type="button"
            className={`${styles.segmentedTab} ${activeTab === 'register' ? styles.active : ''}`}
            onClick={() => toggleTab('register')}
          >
            <UserPlus size={15} /> <span>Регистрация</span>
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className={styles.errorAlert}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {/* Form Fields */}
        <form onSubmit={handleSubmit}>
          {activeTab === 'register' && (
            <div className={styles.formGroup}>
              <label className={styles.label}>
                Имя пользователя <span className={styles.required}>*</span>
              </label>
              <div className={styles.inputWrapper}>
                <UserIcon size={15} className={styles.inputIcon} />
                <input
                  type="text"
                  className={styles.input}
                  placeholder="JohnDoe (только латиница и цифры)"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  pattern="[a-zA-Z0-9]+"
                  title="Только латинские буквы и цифры"
                  autoComplete="username"
                  autoFocus
                />
              </div>
            </div>
          )}

          <div className={styles.formGroup}>
            <label className={styles.label}>
              E-mail <span className={styles.required}>*</span>
            </label>
            <div className={styles.inputWrapper}>
              <Mail size={15} className={styles.inputIcon} />
              <input
                type="email"
                className={styles.input}
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus={activeTab === 'login'}
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>
              Пароль <span className={styles.required}>*</span>
            </label>
            <div className={styles.inputWrapper}>
              <Lock size={15} className={styles.inputIcon} />
              <input
                type={showPassword ? 'text' : 'password'}
                className={`${styles.input} ${styles.hasRightAction}`}
                placeholder="Минимум 6 символов"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
              <button
                type="button"
                className={styles.eyeBtn}
                onClick={() => setShowPassword(!showPassword)}
                title={showPassword ? 'Скрыть пароль' : 'Показать пароль'}
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          {activeTab === 'register' && (
            <div className={styles.formGroup}>
              <label className={styles.label}>Домашняя страница</label>
              <div className={styles.inputWrapper}>
                <Globe size={15} className={styles.inputIcon} />
                <input
                  type="url"
                  className={styles.input}
                  placeholder="https://example.com (опционально)"
                  value={homePage}
                  onChange={(e) => setHomePage(e.target.value)}
                />
              </div>
            </div>
          )}

          {/* Full-width action button */}
          <button
            type="submit"
            className={styles.submitFullBtn}
            disabled={isLoading}
          >
            <span>
              {isLoading
                ? 'Выполняется вход...'
                : activeTab === 'login'
                ? 'Войти в аккаунт'
                : 'Зарегистрироваться'}
            </span>
            <ArrowRight size={15} />
          </button>
        </form>

        {/* Switch Link in Footer */}
        <div className={styles.switchFooter}>
          {activeTab === 'login' ? (
            <span>
              Впервые у нас?
              <button
                type="button"
                className={styles.switchLink}
                onClick={() => toggleTab('register')}
              >
                Создать профиль
              </button>
            </span>
          ) : (
            <span>
              Уже зарегистрированы?
              <button
                type="button"
                className={styles.switchLink}
                onClick={() => toggleTab('login')}
              >
                Войти в аккаунт
              </button>
            </span>
          )}
        </div>
      </div>
    </ModalComponent>
  );
};
