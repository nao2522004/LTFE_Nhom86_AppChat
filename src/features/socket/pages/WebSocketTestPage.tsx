import React from 'react';
import WebSocketTest from '../../../components/WebSocketTest/WebSocketTest';
import { useAppDispatch, useAppSelector } from '../../../hooks/hooks';
import { logout } from '../../auth/authSlice';
import SocketStatusIndicator from "../components/SocketStatusIndicator";

const WebSocketTestPage: React.FC = () => {
    const dispatch = useAppDispatch();
    const { user, isAuthenticated } = useAppSelector((state) => state.auth);

    const handleLogout = () => {
        dispatch(logout());
    };

    return (
        <div style={styles.page}>
            <nav style={styles.navbar}>
                <div style={styles.navContent}>
                    <h1 style={styles.navTitle}>WebSocket Test Dashboard</h1>
                    <div style={styles.navRight}>
                        <SocketStatusIndicator />
                        {isAuthenticated && user && (
                            <>
                                <span style={styles.userInfo}>
                                    {user.displayName || user.username}
                                </span>
                                <button onClick={handleLogout} style={styles.logoutButton}>
                                    Đăng xuất
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </nav>
            
            <div style={styles.content}>
                <WebSocketTest />
            </div>
        </div>
    );
};

const styles: { [key: string]: React.CSSProperties } = {
    page: {
        minHeight: '100vh',
        background: '#f5f7fa'
    },
    navbar: {
        background: 'white',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        marginBottom: '20px'
    },
    navContent: {
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '15px 20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    navTitle: {
        margin: 0,
        fontSize: '20px',
        color: '#333'
    },
    navRight: {
        display: 'flex',
        alignItems: 'center',
        gap: '15px'
    },
    userInfo: {
        fontSize: '14px',
        color: '#666'
    },
    logoutButton: {
        padding: '8px 16px',
        background: '#dc3545',
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: '500',
        transition: 'all 0.3s'
    },
    content: {
        padding: '0 20px'
    }
};

export default WebSocketTestPage;