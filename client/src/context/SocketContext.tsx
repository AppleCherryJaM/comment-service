import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import type { Comment } from '../types';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  newCommentNotification: Comment | null;
  clearNotification: () => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [newCommentNotification, setNewCommentNotification] = useState<Comment | null>(null);

  useEffect(() => {
    const socketInstance = io('/', {
      transports: ['websocket', 'polling'],
      autoConnect: true,
    });

    socketInstance.on('connect', () => {
      setIsConnected(true);
    });

    socketInstance.on('disconnect', () => {
      setIsConnected(false);
    });

    socketInstance.on('commentCreated', (comment: Comment) => {
      setNewCommentNotification(comment);
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  const clearNotification = () => setNewCommentNotification(null);

  return (
    <SocketContext.Provider
      value={{
        socket,
        isConnected,
        newCommentNotification,
        clearNotification,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};
