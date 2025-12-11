import { useEffect, useState } from 'react';
import { Socket } from 'socket.io-client';
import socketService from '../services/socket';
import { useAppDispatch, useAppSelector } from './hooks';
import { setWsConnected } from '../features/auth/authSlice';

export const useSocket = () => {
    const [socket, setSocket] = useState<Socket | null>(null);
    const dispatch = useAppDispatch();
    const { token, isAuthenticated } = useAppSelector((state) => state.auth);

    // useEffect(() => {
    //     if (isAuthenticated && token) {
    //         const socketInstance = socketService.connect(token);
    //         setSocket(socketInstance);

    //         const handleConnect = () => {
    //             console.log('Socket connected');
    //             dispatch(setSocketConnected(true));
    //         };

    //         const handleDisconnect = () => {
    //             console.log('Socket disconnected');
    //             dispatch(setSocketConnected(false));
    //         };

    //         socketInstance.on('connect', handleConnect);
    //         socketInstance.on('disconnect', handleDisconnect);

    //         // Cleanup
    //         return () => {
    //             socketInstance.off('connect', handleConnect);
    //             socketInstance.off('disconnect', handleDisconnect);
    //         };
    //     } else {
    //         socketService.disconnect();
    //         setSocket(null);
    //         dispatch(setSocketConnected(false));
    //     }
    // }, [isAuthenticated, token, dispatch]);

    // return {
    //     socket,
    //     isConnected: socketService.isConnected(),
    //     emit: socketService.emit.bind(socketService),
    //     on: socketService.on.bind(socketService),
    //     off: socketService.off.bind(socketService)
    // };
};

export default useSocket;