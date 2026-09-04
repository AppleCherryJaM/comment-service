import React, { useState } from 'react';
import { LogIn, LogOut, Wifi, WifiOff } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { AuthModal } from '../auth/AuthModal';
import styles from './Header.module.scss';

export const Header: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { isConnected } = useSocket();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);

  const displayName = user?.name || user?.username || user?.email || 'Пользователь';
  const initialLetter = displayName.charAt(0).toUpperCase();

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <div className={styles.brand}>
          <img
            src="/cta_logo_badge_dark.svg"
            alt="CTA Logo"
            className={styles.brandLogo}
          />
          <div className={styles.brandInfo}>
            <h1 className={styles.brandTitle}>Dzencode Comments</h1>
            <span className={styles.brandSubtitle}>SPA Комментарии с каскадным деревом</span>
          </div>
        </div>

        <div className={styles.actions}>
          {/* Socket Connection Badge */}
          <div
            className={`${styles.socketBadge} ${isConnected ? styles.online : styles.offline}`}
            title={isConnected ? 'WebSocket подключён' : 'WebSocket отключён'}
          >
            {isConnected ? <Wifi size={14} /> : <WifiOff size={14} />}
            <span>{isConnected ? 'Real-time' : 'Offline'}</span>
          </div>

          {/* User Auth Section */}
          {isAuthenticated && user ? (
            <div className={styles.userBadge}>
              <div className={styles.userBadgeAvatar}>{initialLetter}</div>
              <span className={styles.userBadgeName}>{displayName}</span>
              <button
                type="button"
                className={styles.userBadgeLogout}
                onClick={logout}
                title="Выйти из аккаунта"
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <button
              type="button"
              className={styles.authBtn}
              onClick={() => setIsAuthModalOpen(true)}
            >
              <LogIn size={15} /> <span>Войти / Регистрация</span>
            </button>
          )}
        </div>
      </div>

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </header>
  );
};
