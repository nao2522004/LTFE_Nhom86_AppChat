import React, { useEffect, useRef, useState } from 'react';
import socketService from '../../services/socket';
import { useAppSelector } from '../../hooks/hooks';

interface ConnectionLog {
    timestamp: string;
    event: 'connect' | 'disconnect' | 'error' | 'mount' | 'unmount';
    message: string;
}

const WebSocketTest: React.FC = () => {
    const [logs, setLogs] = useState<ConnectionLog[]>([]);
    const [isManuallyDisconnected, setIsManuallyDisconnected] = useState(false);
    const mountCountRef = useRef(0);
    const connectCountRef = useRef(0);
    const disconnectCountRef = useRef(0);
    
    const { token, isAuthenticated, socketConnected } = useAppSelector((state) => state.auth);

    const addLog = (event: ConnectionLog['event'], message: string) => {
        const timestamp = new Date().toLocaleTimeString('vi-VN', { 
            hour12: false,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            fractionalSecondDigits: 3
        });
        
        setLogs(prev => [...prev, { timestamp, event, message }]);
    };

    useEffect(() => {
        mountCountRef.current += 1;
        addLog('mount', `Component mounted (Lần ${mountCountRef.current})`);

        if (!isAuthenticated || !token) {
            addLog('error', 'Chưa đăng nhập - không thể kết nối socket');
            return;
        }

        // Setup socket connection
        const socket = socketService.connect(token);

        // onOpen equivalent (connect event)
        const handleConnect = () => {
            connectCountRef.current += 1;
            addLog('connect', `✅ Socket CONNECTED - Socket ID: ${socket.id} (Lần ${connectCountRef.current})`);
        };

        // onClose equivalent (disconnect event)
        const handleDisconnect = (reason: string) => {
            disconnectCountRef.current += 1;
            addLog('disconnect', `❌ Socket DISCONNECTED - Lý do: ${reason} (Lần ${disconnectCountRef.current})`);
        };

        const handleConnectError = (error: any) => {
            addLog('error', `⚠️ Connection Error: ${error.message}`);
        };

        const handleError = (error: any) => {
            addLog('error', `⚠️ Socket Error: ${error}`);
        };

        // Register event listeners
        socket.on('connect', handleConnect);
        socket.on('disconnect', handleDisconnect);
        socket.on('connect_error', handleConnectError);
        socket.on('error', handleError);

        // Check if already connected
        if (socket.connected) {
            connectCountRef.current += 1;
            addLog('connect', `✅ Socket đã CONNECTED - Socket ID: ${socket.id} (Lần ${connectCountRef.current})`);
        }

        // Cleanup function (unmount)
        return () => {
            addLog('unmount', `Component unmounting (Mount count: ${mountCountRef.current})`);
            
            socket.off('connect', handleConnect);
            socket.off('disconnect', handleDisconnect);
            socket.off('connect_error', handleConnectError);
            socket.off('error', handleError);
            
            // Note: We don't disconnect here to maintain connection across component unmounts
        };
    }, [token, isAuthenticated]);

    const handleManualDisconnect = () => {
        socketService.disconnect();
        setIsManuallyDisconnected(true);
        addLog('disconnect', '🔌 Manual disconnect triggered');
    };

    const handleManualConnect = () => {
        if (token) {
            socketService.connect(token);
            setIsManuallyDisconnected(false);
            addLog('connect', '🔌 Manual connect triggered');
        }
    };

    const clearLogs = () => {
        setLogs([]);
    };

    const getEventColor = (event: ConnectionLog['event']) => {
        switch (event) {
            case 'connect':
                return '#28a745';
            case 'disconnect':
                return '#dc3545';
            case 'error':
                return '#ffc107';
            case 'mount':
                return '#17a2b8';
            case 'unmount':
                return '#6c757d';
            default:
                return '#333';
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h2 style={styles.title}>🔌 WebSocket Connection Test</h2>
                <div style={styles.statusBadge}>
                    <div 
                        style={{
                            ...styles.statusDot,
                            backgroundColor: socketConnected ? '#28a745' : '#dc3545'
                        }}
                    />
                    <span style={styles.statusText}>
                        {socketConnected ? 'Connected' : 'Disconnected'}
                    </span>
                </div>
            </div>

            <div style={styles.stats}>
                <div style={styles.statCard}>
                    <div style={styles.statValue}>{mountCountRef.current}</div>
                    <div style={styles.statLabel}>Component Mounts</div>
                </div>
                <div style={styles.statCard}>
                    <div style={styles.statValue}>{connectCountRef.current}</div>
                    <div style={styles.statLabel}>Connect Events</div>
                </div>
                <div style={styles.statCard}>
                    <div style={styles.statValue}>{disconnectCountRef.current}</div>
                    <div style={styles.statLabel}>Disconnect Events</div>
                </div>
            </div>

            <div style={styles.controls}>
                <button
                    onClick={handleManualConnect}
                    disabled={socketConnected || !token}
                    style={{
                        ...styles.button,
                        ...styles.connectButton,
                        ...(socketConnected || !token ? styles.buttonDisabled : {})
                    }}
                >
                    🔌 Connect
                </button>
                <button
                    onClick={handleManualDisconnect}
                    disabled={!socketConnected}
                    style={{
                        ...styles.button,
                        ...styles.disconnectButton,
                        ...(!socketConnected ? styles.buttonDisabled : {})
                    }}
                >
                    🔌 Disconnect
                </button>
                <button
                    onClick={clearLogs}
                    style={{
                        ...styles.button,
                        ...styles.clearButton
                    }}
                >
                    🗑️ Clear Logs
                </button>
            </div>

            {!isAuthenticated && (
                <div style={styles.warning}>
                    ⚠️ Bạn cần đăng nhập để test WebSocket connection
                </div>
            )}

            <div style={styles.logsContainer}>
                <div style={styles.logsHeader}>
                    <h3 style={styles.logsTitle}>📋 Connection Logs</h3>
                    <span style={styles.logsCount}>{logs.length} events</span>
                </div>
                
                <div style={styles.logsList}>
                    {logs.length === 0 ? (
                        <div style={styles.emptyLogs}>
                            Chưa có logs. Kết nối sẽ tự động bắt đầu khi đăng nhập.
                        </div>
                    ) : (
                        logs.map((log, index) => (
                            <div key={index} style={styles.logItem}>
                                <span style={styles.logTimestamp}>{log.timestamp}</span>
                                <span 
                                    style={{
                                        ...styles.logEvent,
                                        color: getEventColor(log.event)
                                    }}
                                >
                                    [{log.event.toUpperCase()}]
                                </span>
                                <span style={styles.logMessage}>{log.message}</span>
                            </div>
                        ))
                    )}
                </div>
            </div>

            <div style={styles.info}>
                <h4 style={styles.infoTitle}>ℹ️ Test Instructions:</h4>
                <ul style={styles.infoList}>
                    <li>✅ Verify component chỉ mount 1 lần khi load trang</li>
                    <li>✅ Verify onConnect (connect event) chỉ fire 1 lần</li>
                    <li>✅ Verify onDisconnect (disconnect event) khi mất kết nối</li>
                    <li>✅ Test manual disconnect/reconnect</li>
                    <li>✅ Kiểm tra cleanup khi unmount không gây reconnect</li>
                </ul>
            </div>
        </div>
    );
};

const styles: { [key: string]: React.CSSProperties } = {
    container: {
        maxWidth: '900px',
        margin: '20px auto',
        padding: '20px',
        fontFamily: 'monospace'
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px',
        padding: '20px',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: '12px',
        color: 'white'
    },
    title: {
        margin: 0,
        fontSize: '24px'
    },
    statusBadge: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        background: 'rgba(255,255,255,0.2)',
        padding: '8px 16px',
        borderRadius: '20px'
    },
    statusDot: {
        width: '12px',
        height: '12px',
        borderRadius: '50%'
    },
    statusText: {
        fontWeight: 'bold',
        fontSize: '14px'
    },
    stats: {
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '15px',
        marginBottom: '20px'
    },
    statCard: {
        background: 'white',
        padding: '20px',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        textAlign: 'center'
    },
    statValue: {
        fontSize: '32px',
        fontWeight: 'bold',
        color: '#667eea',
        marginBottom: '8px'
    },
    statLabel: {
        fontSize: '12px',
        color: '#666',
        textTransform: 'uppercase',
        letterSpacing: '1px'
    },
    controls: {
        display: 'flex',
        gap: '10px',
        marginBottom: '20px'
    },
    button: {
        flex: 1,
        padding: '12px 20px',
        border: 'none',
        borderRadius: '8px',
        fontSize: '14px',
        fontWeight: 'bold',
        cursor: 'pointer',
        transition: 'all 0.3s',
        fontFamily: 'monospace'
    },
    connectButton: {
        background: '#28a745',
        color: 'white'
    },
    disconnectButton: {
        background: '#dc3545',
        color: 'white'
    },
    clearButton: {
        background: '#6c757d',
        color: 'white'
    },
    buttonDisabled: {
        opacity: 0.5,
        cursor: 'not-allowed'
    },
    warning: {
        padding: '15px',
        background: '#fff3cd',
        border: '1px solid #ffc107',
        borderRadius: '8px',
        color: '#856404',
        marginBottom: '20px',
        textAlign: 'center'
    },
    logsContainer: {
        background: 'white',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        marginBottom: '20px',
        overflow: 'hidden'
    },
    logsHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '15px 20px',
        background: '#f8f9fa',
        borderBottom: '1px solid #dee2e6'
    },
    logsTitle: {
        margin: 0,
        fontSize: '16px',
        color: '#333'
    },
    logsCount: {
        fontSize: '12px',
        color: '#666',
        background: '#e9ecef',
        padding: '4px 12px',
        borderRadius: '12px'
    },
    logsList: {
        maxHeight: '400px',
        overflowY: 'auto',
        padding: '10px'
    },
    emptyLogs: {
        padding: '40px 20px',
        textAlign: 'center',
        color: '#999',
        fontSize: '14px'
    },
    logItem: {
        padding: '10px',
        borderBottom: '1px solid #f0f0f0',
        fontSize: '13px',
        display: 'flex',
        gap: '10px',
        alignItems: 'center'
    },
    logTimestamp: {
        color: '#999',
        minWidth: '90px'
    },
    logEvent: {
        fontWeight: 'bold',
        minWidth: '120px'
    },
    logMessage: {
        color: '#333',
        flex: 1
    },
    info: {
        background: '#e7f3ff',
        border: '1px solid #b3d9ff',
        borderRadius: '8px',
        padding: '20px'
    },
    infoTitle: {
        margin: '0 0 10px 0',
        color: '#004085',
        fontSize: '16px'
    },
    infoList: {
        margin: 0,
        paddingLeft: '20px',
        color: '#004085'
    }
};

export default WebSocketTest;