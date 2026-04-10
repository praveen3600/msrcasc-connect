import { io } from 'socket.io-client';

let socket = null;

export const connectSocket = () => {
  if (socket?.connected) return socket;

  // In production, connect to the backend URL (without /api suffix).
  // In dev, the Vite proxy handles it so '/' works.
  const backendUrl = import.meta.env.VITE_API_URL
    ? import.meta.env.VITE_API_URL.replace(/\/api\/?$/, '')
    : '/';

  socket = io(backendUrl, {
    transports: ['websocket', 'polling'],
    withCredentials: true, // Send cookies for auth (HTTP-only JWT)
  });

  socket.on('connect', () => {
    console.log('🟢 Socket connected');
  });

  socket.on('connect_error', (err) => {
    console.error('🔴 Socket connection error:', err.message);
  });

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const getSocket = () => socket;
