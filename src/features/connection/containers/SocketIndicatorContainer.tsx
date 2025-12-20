import React from 'react';
import { useAppSelector } from '../../../hooks/hooks';
import {
    selectConnectionStatus,
    selectReconnectAttempts,
    selectMaxReconnectAttempts
} from '../connectionSlice';
import SocketIndicatorView from '../components/SocketIndicatorView';

/**
 * CONTROLLER
 * Đọc state từ Redux và truyền xuống View
 */
const SocketIndicatorContainer: React.FC = () => {
    // ========== SELECTORS (Đọc từ MODEL) ==========
    const status = useAppSelector(selectConnectionStatus);
    const reconnectAttempts = useAppSelector(selectReconnectAttempts);
    const maxAttempts = useAppSelector(selectMaxReconnectAttempts);

    // ========== COMPUTED VALUES (CONTROLLER LOGIC) ==========
    const getStatusText = () => {
        switch (status) {
            case 'connected':
                return 'Connected';
            case 'connecting':
                return 'Connecting...';
            case 'reconnecting':
                return `Reconnecting (${reconnectAttempts}/${maxAttempts})...`;
            case 'disconnected':
                return 'Disconnected';
            default:
                return 'Unknown';
        }
    };

    const getStatusClass = () => {
        if (status === 'connected') return 'connected';
        if (status === 'reconnecting') return 'reconnecting';
        return 'disconnected';
    };

    // ========== RENDER VIEW ==========
    return (
        <SocketIndicatorView
            statusText={getStatusText()}
            statusClass={getStatusClass()}
        />
    );
};

export default SocketIndicatorContainer;