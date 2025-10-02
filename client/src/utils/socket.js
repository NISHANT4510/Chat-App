import { io } from 'socket.io-client';
import store from '../store/store';

let socket;
let reconnectTimer;

export const connectSocket = (userId) => {
    if (!userId) {
        console.error('Cannot connect socket: No user ID provided');
        return;
    }

    // Clear any existing socket
    if (socket) {
        socket.removeAllListeners();
        socket.disconnect();
    }

    const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    const socketURL = baseURL.replace(/\/api$/, ''); // Remove /api if present
    
    socket = io(socketURL, {
        query: { userId },
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        timeout: 10000,
        withCredentials: true,
        transports: ['websocket', 'polling'],
        path: '/socket.io/'
    });

    socket.on('connect', () => {
        console.log('Connected to socket server with ID:', socket.id);
        store.dispatch({ type: 'SOCKET_CONNECTED', payload: true });
        if (reconnectTimer) {
            clearInterval(reconnectTimer);
            reconnectTimer = null;
        }
    });

    socket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
        store.dispatch({ type: 'SOCKET_ERROR', payload: error.message });
        startReconnectTimer();
    });

    socket.on('disconnect', (reason) => {
        console.log('Socket disconnected:', reason);
        store.dispatch({ type: 'SOCKET_CONNECTED', payload: false });
        startReconnectTimer();
    });

    socket.on('getOnlineUsers', (onlineUsers) => {
        console.log('Online users updated:', onlineUsers);
        store.dispatch({ type: 'SET_ONLINE_USERS', payload: onlineUsers });
    });

    socket.on('newMessage', (message) => {
        console.log('New message received:', message);
        store.dispatch({ type: 'NEW_MESSAGE', payload: message });
    });

    socket.on('messageError', (error) => {
        console.error('Message error:', error);
        // You can dispatch an action to show error in UI
        store.dispatch({ type: 'MESSAGE_ERROR', payload: error });
    });
};

export const sendMessage = (message) => {
    return new Promise((resolve, reject) => {
        if (!socket || !socket.connected) {
            console.warn('Socket not connected, attempting to reconnect...');
            if (socket) {
                socket.connect();
            }
            reject(new Error('Socket not connected'));
            return;
        }

        // Add timeout for message acknowledgment
        const timeout = setTimeout(() => {
            reject(new Error('Message send timeout'));
        }, 5000);

        socket.emit('sendMessage', message, (response) => {
            clearTimeout(timeout);
            if (response && response.error) {
                reject(new Error(response.error));
            } else {
                resolve(response);
            }
        });
    });
};

const startReconnectTimer = () => {
    if (reconnectTimer) {
        clearInterval(reconnectTimer);
    }
    reconnectTimer = setInterval(() => {
        if (socket && !socket.connected) {
            console.log('Attempting to reconnect socket...');
            socket.connect();
        }
    }, 5000);
};

export const disconnectSocket = () => {
    if (reconnectTimer) {
        clearInterval(reconnectTimer);
        reconnectTimer = null;
    }
    if (socket) {
        socket.removeAllListeners();
        socket.disconnect();
    }
};

export const getSocket = () => socket;