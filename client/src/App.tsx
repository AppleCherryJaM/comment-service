import React from 'react';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { Header } from './components/layout/Header';
import { CommentList } from './components/comments/CommentList';

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <SocketProvider>
        <div className="app-root">
          <Header />
          <main className="app-layout">
            <CommentList />
          </main>
        </div>
      </SocketProvider>
    </AuthProvider>
  );
};

export default App;
