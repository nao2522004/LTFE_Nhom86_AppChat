import React from 'react';
import { useAppSelector } from '../../hooks/hooks';
import styles from './SocketIndicator.module.css';

const SocketIndicator: React.FC = () => {
    const { wsConnected } = useAppSelector((state) => state.auth);

    return (
        <div className={`${styles.indicator} ${wsConnected ? styles.connected : styles.disconnected}`}>
            <span className={styles.dot} />
            <span className={styles.text}>
                {wsConnected ? 'WebSocket Connected' : 'WebSocket Disconnected'}
            </span>
        </div>
    );
};

export default SocketIndicator;