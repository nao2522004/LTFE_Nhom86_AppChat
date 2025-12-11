import React, { useEffect } from 'react';
import AppRoutes from './routes';
import { useAppDispatch, useAppSelector } from './hooks/hooks';
import { getCurrentUser, updateUserStatus, setWsConnected } from './features/auth/authSlice';
import websocketService from './services/websocket';

function App() {
    const dispatch = useAppDispatch();
    const { token, isAuthenticated } = useAppSelector((state) => state.auth);

    useEffect(() => {
        // If having token, connect WebSocket and get user
        if (token && !isAuthenticated) {
            dispatch(getCurrentUser());
        }
    }, [token, isAuthenticated, dispatch]);

    useEffect(() => {
        if (isAuthenticated && token) {
            // Setup WebSocket event handlers
            const handleOpen = (data: any) => {
                console.log('WebSocket connected in App');
                dispatch(setWsConnected(true));
            };

            const handleClose = (data: any) => {
                console.log('WebSocket disconnected in App');
                dispatch(setWsConnected(false));
            };

            const handleUserOnline = (data: { userId: string }) => {
                dispatch(updateUserStatus({ userId: data.userId, isOnline: true }));
            };

            const handleUserOffline = (data: { userId: string }) => {
                dispatch(updateUserStatus({ userId: data.userId, isOnline: false }));
            };

            const handleError = (error: any) => {
                console.error('WebSocket error:', error);
            };

            // Register handlers
            websocketService.on('open', handleOpen);
            websocketService.on('close', handleClose);
            websocketService.on('USER_ONLINE', handleUserOnline);
            websocketService.on('USER_OFFLINE', handleUserOffline);
            websocketService.on('error', handleError);

            // Cleanup
            return () => {
                websocketService.off('open', handleOpen);
                websocketService.off('close', handleClose);
                websocketService.off('USER_ONLINE', handleUserOnline);
                websocketService.off('USER_OFFLINE', handleUserOffline);
                websocketService.off('error', handleError);
            };
        }
    }, [isAuthenticated, token, dispatch]);

    return <AppRoutes />;
}

export default App;