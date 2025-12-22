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
        if (status === 'reconnecting') return 'reconnecting';
        return 'disconnected';
    };

    return (
        <div className={`${styles.indicator} ${styles[getStatusClass()]}`}>
            <span className={styles.dot}/>
            <span className={styles.text}>{getStatusText()}</span>
        </div>
    );
};

export default SocketStatusIndicator;