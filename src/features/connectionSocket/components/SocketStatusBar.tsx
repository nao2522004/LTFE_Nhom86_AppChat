import React, {useCallback, useState} from 'react';
import { useAppSelector } from '../../../hooks/hooks';
import {
    selectConnectionStatus,
    selectReconnectAttempts,
    selectMaxReconnectAttempts
} from '../connectionSlice';
import styles from './SocketStatusBar.module.css'

const SocketStatusBar: React.FC = () => {
    const [expanded, setExpanded] = useState(false);

    const status = useAppSelector(selectConnectionStatus);
    const attempts = useAppSelector(selectReconnectAttempts);
    const maxAttempts = useAppSelector(selectMaxReconnectAttempts);

    const handleToggleExpand = useCallback(() => {
        setExpanded(prev => !prev);
    }, []);

    const handleReload = useCallback(() => {
        window.location.reload();
    }, []);

    if (status === 'connected') return null;

    const isError = status === 'disconnected';
    const isReconnecting = status === 'reconnecting' || status === 'connecting';

    return (
        <div className={styles.container}>
            <div className={`${styles.capsule} ${isError ? styles.errorMode : styles.warningMode}`}>

                {/* Main Info */}
                <div className={styles.mainInfo} onClick={handleToggleExpand}>
                    <div className={`${styles.dot} ${isReconnecting ? styles.pulse : styles.dead}`} />

                    <span className={styles.message}>
                        {isReconnecting
                            ? `Đang kết nối lại... (${attempts}/${maxAttempts})`
                            : 'Mất kết nối hoàn toàn'}
                    </span>

                    <span className={styles.chevron}>
                        {expanded ? '▲' : '▼'}
                    </span>
                </div>

                {/* Expanded Content */}
                {expanded && (
                    <div className={styles.expandContent}>
                        <div className={styles.helpText}>
                            {isReconnecting ? (
                                <p>
                                    Hệ thống đang tự động kết nối lại.
                                    Vui lòng kiểm tra lại đường truyền internet.
                                </p>
                            ) : (
                                <p>
                                    Không thể kết nối tự động.
                                    Vui lòng tải lại trang để thử lại thủ công.
                                </p>
                            )}
                        </div>

                        <button className={styles.reloadBtn} onClick={handleReload}>
                            {isError ? 'Kết nối ngay' : 'Thử lại'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SocketStatusBar;