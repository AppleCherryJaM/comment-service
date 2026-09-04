import React, { useState } from 'react';
import { LogIn, UserPlus, AlertCircle } from 'lucide-react';
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

  const tabsHeader = (
    <div className={styles.tabs}>
      <button
        type="button"
        className={`${styles.tab} ${activeTab === 'login' ? styles.active : ''}`}
        onClick={() => {
          setActiveTab('login');
          setError('');
        }}
      >
        <LogIn size={16} /> Вход
      </button>
      <button
        type="button"
        className={`${styles.tab} ${activeTab === 'register' ? styles.active : ''}`}
        onClick={() => {
          setActiveTab('register');
          setError('');
        }}
      >
        <UserPlus size={16} /> Регистрация
      </button>
    </div>
  );

  return (
    <ModalComponent
      isOpen={isOpen}
      onClose={onClose}
      headerExtra={tabsHeader}
      size="md"
    >
      <form onSubmit={handleSubmit}>
        {error && (
          <div className={styles.errorAlert}>
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {activeTab === 'register' && (
          <div className={styles.formGroup}>
            <label className={styles.label}>
              Имя пользователя <span className={styles.required}>*</span>
            </label>
            <input
              type="text"
              className={styles.input}
              placeholder="ИванИванов (только латиница и цифры)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              pattern="[a-zA-Z0-9]+"
              title="Только латинские буквы и цифры"
            />
          </div>
        )}

        <div className={styles.formGroup}>
          <label className={styles.label}>
            E-mail <span className={styles.required}>*</span>
          </label>
          <input
            type="email"
            className={styles.input}
            placeholder="name@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>
            Пароль <span className={styles.required}>*</span>
          </label>
          <input
            type="password"
            className={styles.input}
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
          />
        </div>

        {activeTab === 'register' && (
          <div className={styles.formGroup}>
            <label className={styles.label}>Домашняя страница</label>
            <input
              type="url"
              className={styles.input}
              placeholder="https://example.com"
              value={homePage}
              onChange={(e) => setHomePage(e.target.value)}
            />
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1.25rem' }}>
          <button type="button" className={styles.cancelBtn} onClick={onClose}>
            Отмена
          </button>
          <button type="submit" className={styles.submitBtn} disabled={isLoading}>
            {isLoading ? 'Загрузка...' : activeTab === 'login' ? 'Войти' : 'Зарегистрироваться'}
          </button>
        </div>
      </form>
    </ModalComponent>
  );
};
