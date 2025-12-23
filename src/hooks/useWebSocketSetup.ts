import {useEffect, useRef} from 'react';
import { useAppDispatch, useAppSelector } from './hooks';
import {
    setConnected,
    setDisconnected,
    setReconnecting,
    incrementReconnectAttempts,
    resetReconnectAttempts,
    setConnectionError
} from '../features/connectionSocket/connectionSlice';
import {addMessage, addRoom, getUserList} from '../features/chat/chatSlice';
import websocketService from "../services/websocket/MainService";

/**
 * Hook để setup WebSocket event listeners
 * Chỉ gọi 1 lần ở App.tsx
 * SYNC CẢ 2 STATE: authSlice.wsConnected + connectionSlice.status
 */
export const useWebSocketSetup = () => {
    const dispatch = useAppDispatch();
    const { isAuthenticated } = useAppSelector((state) => state.auth);

    // Track if user list has been loaded
    const userListLoadedRef = useRef(false);
    const isSetupRef = useRef(false);

    useEffect(() => {
        if (!isAuthenticated) return;

        if (isSetupRef.current) {
            console.log('[useWebSocketSetup] Already setup, skipping...');
            return;
        }

        isSetupRef.current = true;
        console.log('[useWebSocketSetup] Setting up WebSocket listeners...');

        const handleOpen = () => {
            console.log('WebSocket Connected');

            dispatch(setConnected());
            dispatch(resetReconnectAttempts());

            setTimeout(() => {
                console.log('[WS EVENT] State after setConnected should be "connected"');
            }, 50);

            // Load user list ONLY ONCE when connected
            if (!userListLoadedRef.current) {
                console.log('Loading user list on first connectionSocket...');
                dispatch(getUserList());
                userListLoadedRef.current = true;
            }
        };

        const handleClose = (data: any) => {
            console.log('WebSocket Closed:', data);
            dispatch(setDisconnected({
                isManual: false,
                error: data.reason
            }));
        };

        const handleError = (error: any) => {
            console.error('WebSocket Error:', error);
            dispatch(setConnectionError(error.message || 'Connection error'));
        };

        const handleReconnecting = (data: any) => {
            console.log('WebSocket Reconnecting...', data);
            dispatch(setReconnecting());
            dispatch(incrementReconnectAttempts());
        };

        const handleReconnectionFailed = () => {
            console.error('Max reconnection attempts reached');
            dispatch(setDisconnected({
                isManual: false,
                error: 'Failed to reconnect after multiple attempts'
            }));
        };

        // ===== CHAT EVENTS =====

        // Nhận tin nhắn mới từ server
        const handleSendChat = (message: any) => {
            console.log('Received SEND_CHAT:', message);

            if (message.status === 'success' && message.data) {
                // Transform server message to app Message type
                const newMessage = {
                    id: message.data.id || `msg_${Date.now()}`,
                    content: message.data.mes || message.data.content,
                    sender: {
                        id: message.data.from?.id || message.data.from,
                        username: message.data.from?.username || message.data.from,
                        displayName: message.data.from?.displayName,
                        avatar: message.data.from?.avatar
                    },
                    roomId: message.data.to || message.data.roomId,
                    timestamp: message.data.timestamp
                        ? new Date(message.data.timestamp).toISOString()
                        : new Date().toISOString(),
                    status: 'sent' as const,
                    type: 'text' as const
                };

                dispatch(addMessage(newMessage));
            }
        };

        // User join/leave room events
        const handleJoinRoom = (data: any) => {
            console.log('User joined room:', data);
            // Handle user join notification
        };

        const handleLeaveRoom = (data: any) => {
            console.log('User left room:', data);
            // Handle user leave notification
        };

        // Room created event
        const handleCreateRoom = (data: any) => {
            console.log('Room created:', data);
            if (data.status === 'success' && data.data?.room) {
                dispatch(addRoom(data.data.room));
            }
        };

        // ===== USER EVENTS =====

        const handleUserOnline = (data: any) => {
            console.log('User online:', data);
            // Update user status in userList
        };

        const handleUserOffline = (data: any) => {
            console.log('User offline:', data);
            // Update user status in userList
        };

        // ===== REGISTER LISTENERS =====

        // Connection events
        websocketService.on('open', handleOpen);
        websocketService.on('close', handleClose);
        websocketService.on('error', handleError);
        websocketService.on('reconnecting', handleReconnecting);
        websocketService.on('reconnection_failed', handleReconnectionFailed);

        // Chat events
        websocketService.on('SEND_CHAT', handleSendChat);
        websocketService.on('JOIN_ROOM', handleJoinRoom);
        websocketService.on('LEAVE_ROOM', handleLeaveRoom);
        websocketService.on('CREATE_ROOM', handleCreateRoom);

        // User events
        websocketService.on('USER_ONLINE', handleUserOnline);
        websocketService.on('USER_OFFLINE', handleUserOffline);

        // Generic message handler (for debugging)
        websocketService.on('message', (message: any) => {
            console.log('WebSocket Message:', message);
        });

        if (websocketService.isConnected()) {
            console.log('[useWebSocketSetup] WebSocket already connected, triggering handleOpen manually');
            handleOpen();
        }
        console.log('[useWebSocketSetup] All listeners registered');

        // ===== CLEANUP =====
        return () => {
            console.log('Cleaning up WebSocket listeners');

            // Remove all listeners
            websocketService.off('open', handleOpen);
            websocketService.off('close', handleClose);
            websocketService.off('error', handleError);
            websocketService.off('reconnecting', handleReconnecting);
            websocketService.off('reconnection_failed', handleReconnectionFailed);

            websocketService.off('SEND_CHAT', handleSendChat);
            websocketService.off('JOIN_ROOM', handleJoinRoom);
            websocketService.off('LEAVE_ROOM', handleLeaveRoom);
            websocketService.off('CREATE_ROOM', handleCreateRoom);

            websocketService.off('USER_ONLINE', handleUserOnline);
            websocketService.off('USER_OFFLINE', handleUserOffline);

            websocketService.off('message');

            userListLoadedRef.current = false;
        };
    }, [dispatch, isAuthenticated]);
};

export default useWebSocketSetup;