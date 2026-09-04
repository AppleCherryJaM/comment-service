import React, { useState } from 'react';
import { MessageSquare, LogIn, LogOut, Wifi, WifiOff } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { AuthModal } from '../auth/AuthModal';

export const Header: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { isConnected } = useSocket();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);

  const displayName = user?.name || user?.username || user?.email || 'Пользователь';
  const initialLetter = displayName.charAt(0).toUpperCase();

  return (
    <header className="app-header">
      <div className="header-container">
        <div className="brand-block">
          <div className="brand-logo">
            <MessageSquare size={22} />
          </div>
          <div className="brand-info">
            <h1 className="brand-title">Dzencode Comments</h1>
            <span className="brand-subtitle">SPA Комментарии с каскадным деревом</span>
          </div>
        </div>

        <div className="header-actions">
          {/* Socket Connection Badge */}
          <div
            className={`socket-status-badge ${isConnected ? 'online' : 'offline'}`}
            title={isConnected ? 'WebSocket подключён' : 'WebSocket отключён'}
          >
            {isConnected ? <Wifi size={14} /> : <WifiOff size={14} />}
            <span>{isConnected ? 'Real-time' : 'Offline'}</span>
          </div>

          {/* User Auth Section */}
          {isAuthenticated && user ? (
            <div className="user-profile-badge">
              <div className="user-avatar-circle">{initialLetter}</div>
              <span className="user-display-name">{displayName}</span>
              <button
                type="button"
                className="logout-btn"
                onClick={logout}
                title="Выйти из аккаунта"
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <button
              type="button"
              className="btn btn-primary auth-trigger-btn"
              onClick={() => setIsAuthModalOpen(true)}
            >
              <LogIn size={16} /> <span>Войти / Регистрация</span>
            </button>
          )}
        </div>
      </div>

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </header>
  );
};
