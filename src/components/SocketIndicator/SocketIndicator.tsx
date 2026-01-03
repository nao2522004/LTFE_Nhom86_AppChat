import React from 'react';
import { useAppSelector } from '../../hooks/hooks';
import styles from './SocketIndicator.module.css';
import { selectConnectionStatus } from '../../features/socket/socketSlice';

const SocketIndicator: React.FC = () => {
    const connectionStatus = useAppSelector(selectConnectionStatus);
    const isConnected = connectionStatus === 'connected';

    return (
        <div className={`${styles.indicator} ${isConnected ? styles.connected : styles.disconnected}`}>
            <span className={styles.dot} />
            <span className={styles.text}>
                {isConnected ? 'WebSocket Connected' : 'WebSocket Disconnected'}
            </span>
        </div>
    );
};

export default SocketIndicator;