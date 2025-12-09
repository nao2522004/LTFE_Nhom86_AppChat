import React from 'react';
import { useAppSelector } from '../../hooks/hooks';
import styles from './SocketIndicator.module.css';

const SocketIndicator: React.FC = () => {
    const { socketConnected } = useAppSelector((state) => state.auth);

    return (
        <div className={`${styles.indicator} ${socketConnected ? styles.connected : styles.disconnected}`}>
            <span className={styles.dot} />
            <span className={styles.text}>
                {socketConnected ? 'Đã kết nối' : 'Đang kết nối...'}
            </span>
        </div>
    );
};

export default SocketIndicator;