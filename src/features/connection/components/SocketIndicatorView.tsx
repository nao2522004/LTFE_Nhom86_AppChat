import React from 'react';
import styles from './SocketIndicator.module.css';

/**
 * VIEW (Presentational Component)
 * Chỉ nhận props và render UI
 * KHÔNG có logic, KHÔNG gọi Redux
 */
interface SocketIndicatorViewProps {
    statusText: string;
    statusClass: string;
}

const SocketIndicatorView: React.FC<SocketIndicatorViewProps> = ({
                                                                     statusText,
                                                                     statusClass
                                                                 }) => {
    return (
        <div className={`${styles.indicator} ${styles[statusClass]}`}>
            <span className={styles.dot} />
            <span className={styles.text}>{statusText}</span>
        </div>
    );
};

export default SocketIndicatorView;