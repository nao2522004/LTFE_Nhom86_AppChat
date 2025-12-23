import React from 'react';
import styles from './SocketIndicator.module.css';
import {useAppSelector} from "../../../hooks/hooks";
import {selectConnectionStatus, selectMaxReconnectAttempts, selectReconnectAttempts} from "../connectionSlice";

const SocketStatusIndicator: React.FC = () => {
    const status = useAppSelector(selectConnectionStatus);
    const reconnectAttempts = useAppSelector(selectReconnectAttempts);
    const maxAttempts = useAppSelector(selectMaxReconnectAttempts);

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
        if (status === 'reconnecting' || status === 'connecting') return 'reconnecting';
        return 'disconnected';
    };

    const getStatusColor = () => {
        switch (status) {
            case 'connected':
                return '#82e0aa'; // Green
            case 'connecting':
                return '#3498db'; // Blue
            case 'reconnecting':
                return '#f39c12'; // Orange
            case 'disconnected':
                return '#e74c3c'; // Red
            default:
                return '#95a5a6'; // Gray
        }
    };

    return (
        <div
            className={`${styles.indicator} ${styles[getStatusClass()]}`}
            style={{
                borderColor: `${getStatusColor()}33`
            }}
        >
            <span
                className={styles.dot}
                style={{
                    background: getStatusColor(),
                    boxShadow: `0 0 8px ${getStatusColor()}`
                }}
            />
            <span className={styles.text}>{getStatusText()}</span>
        </div>
    );
};

export default SocketStatusIndicator;