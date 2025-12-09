import React, { useEffect } from 'react';
import AppRoutes from './routes';
import { useAppDispatch, useAppSelector } from './hooks/hooks';
import { getCurrentUser, updateUserStatus } from './features/auth/authSlice';
import socketService from './services/socket';

function App() {
    const dispatch = useAppDispatch();
    const { token, isAuthenticated } = useAppSelector((state) => state.auth);

    useEffect(() => {
        // If having token, connect socket and get user
        if (token && !isAuthenticated) {
            dispatch(getCurrentUser());
        }
    }, [token, isAuthenticated, dispatch]);

    useEffect(() => {
        if (isAuthenticated && token) {
            // socket global
            const handleUserOnline = (data: { userId: string }) => {
                dispatch(updateUserStatus({ userId: data.userId, isOnline: true }));
            };

            const handleUserOffline = (data: { userId: string }) => {
                dispatch(updateUserStatus({ userId: data.userId, isOnline: false }));
            };

            const handleError = (error: any) => {
                console.error('Socket error:', error);
            };

            socketService.onUserOnline(handleUserOnline);
            socketService.onUserOffline(handleUserOffline);
            socketService.on('error', handleError);

            // Cleanup
            return () => {
                socketService.off('user:online', handleUserOnline);
                socketService.off('user:offline', handleUserOffline);
                socketService.off('error', handleError);
            };
        }
    }, [isAuthenticated, token, dispatch]);

    return <AppRoutes />;
}

export default App;