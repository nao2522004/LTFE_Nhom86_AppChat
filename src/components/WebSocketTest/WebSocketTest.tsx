import React, { useEffect, useRef, useState } from 'react';
import { useAppSelector } from '../../hooks/hooks';
import websocketService from "../../services/websocket";

interface ConnectionLog {
    timestamp: string;
    event: 'connect' | 'disconnect' | 'error' | 'mount' | 'unmount' | 'message';
    message: string;
}

const WebSocketTest: React.FC = () => {
    const [logs, setLogs] = useState<ConnectionLog[]>([]);
    const mountCountRef = useRef(0);
    const connectCountRef = useRef(0);
    const disconnectCountRef = useRef(0);
    
    const { isAuthenticated, wsConnected } = useAppSelector((state) => state.auth);

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

        if (!isAuthenticated) {
            addLog('error', 'Chưa đăng nhập - chưa kết nối WebSocket');
            return;
        }

        // Connect WebSocket
        websocketService.connect();

        // onOpen handler
        const handleOpen = (data: any) => {
            connectCountRef.current += 1;
            addLog('connect', `✅ WebSocket CONNECTED (Lần ${connectCountRef.current})`);
        };

        // onClose handler
        const handleClose = (data: any) => {
            disconnectCountRef.current += 1;
            addLog('disconnect', `❌ WebSocket DISCONNECTED - Code: ${data.code}, Reason: ${data.reason || 'N/A'} (Lần ${disconnectCountRef.current})`);
        };

        // onError handler
        const handleError = (error: any) => {
            addLog('error', `⚠️ WebSocket Error: ${error.message || 'Unknown error'}`);
        };

        // onMessage handler (general)
        const handleMessage = (message: any) => {
            addLog('message', `📨 Received: ${JSON.stringify(message).substring(0, 100)}...`);
        };

        // Register event listeners
        websocketService.on('open', handleOpen);
        websocketService.on('close', handleClose);
        websocketService.on('error', handleError);
        websocketService.on('message', handleMessage);

        // Check if already connected
        if (websocketService.isConnected()) {
            connectCountRef.current += 1;
            addLog('connect', `✅ WebSocket đã CONNECTED (Lần ${connectCountRef.current})`);
        }

        // Cleanup function (unmount)
        return () => {
            addLog('unmount', `Component unmounting (Mount count: ${mountCountRef.current})`);
            
            websocketService.off('open', handleOpen);
            websocketService.off('close', handleClose);
            websocketService.off('error', handleError);
            websocketService.off('message', handleMessage);
            
            // Note: We don't disconnect here to maintain connection
        };
    }, [isAuthenticated]);

    const handleManualDisconnect = () => {
        websocketService.disconnect();
        addLog('disconnect', '🔌 Manual disconnect triggered');
    };

    const handleManualConnect = () => {
        websocketService.connect();
        addLog('connect', '🔌 Manual connect triggered');
    };

    const handleTestMessage = async () => {
        try {
            await websocketService.send({
                action: 'onchat',
                data: {
                    event: 'PING',
                    data: { timestamp: Date.now() }
                }
            });
            addLog('message', '📤 Sent PING message');
        } catch (error: any) {
            addLog('error', `❌ Failed to send: ${error.message}`);
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
            case 'message':
                return '#6f42c1';
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
                            backgroundColor: wsConnected ? '#28a745' : '#dc3545'
                        }}
                    />
                    <span style={styles.statusText}>
                        {wsConnected ? 'Connected' : 'Disconnected'}
                    </span>
                </div>
            </div>

            <div style={styles.wsInfo}>
                <strong>WebSocket URL:</strong> wss://chat.longapp.site/chat/chat
            </div>

            <div style={styles.stats}>
                <div style={styles.statCard}>
                    <div style={styles.statValue}>{mountCountRef.current}</div>
                    <div style={styles.statLabel}>Component Mounts</div>
                </div>
                <div style={styles.statCard}>
                    <div style={styles.statValue}>{connectCountRef.current}</div>
                    <div style={styles.statLabel}>Connect Events (onOpen)</div>
                </div>
                <div style={styles.statCard}>
                    <div style={styles.statValue}>{disconnectCountRef.current}</div>
                    <div style={styles.statLabel}>Disconnect Events (onClose)</div>
                </div>
            </div>

            <div style={styles.controls}>
                <button
                    onClick={handleManualConnect}
                    disabled={wsConnected}
                    style={{
                        ...styles.button,
                        ...styles.connectButton,
                        ...(wsConnected ? styles.buttonDisabled : {})
                    }}
                >
                    🔌 Connect
                </button>
                <button
                    onClick={handleManualDisconnect}
                    disabled={!wsConnected}
                    style={{
                        ...styles.button,
                        ...styles.disconnectButton,
                        ...(!wsConnected ? styles.buttonDisabled : {})
                    }}
                >
                    🔌 Disconnect
                </button>
                <button
                    onClick={handleTestMessage}
                    disabled={!wsConnected}
                    style={{
                        ...styles.button,
                        ...styles.testButton,
                        ...(!wsConnected ? styles.buttonDisabled : {})
                    }}
                >
                    📤 Send Test Message
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
                    <li>✅ Verify <strong>onOpen</strong> (connect event) chỉ fire 1 lần</li>
                    <li>✅ Verify <strong>onClose</strong> (disconnect event) khi mất kết nối</li>
                    <li>✅ Test manual disconnect/reconnect</li>
                    <li>✅ Test gửi message qua WebSocket</li>
                    <li>✅ Kiểm tra cleanup khi unmount không gây reconnect</li>
                </ul>
            </div>

            <div style={styles.apiInfo}>
                <h4 style={styles.infoTitle}>📡 WebSocket Message Format:</h4>
                <pre style={styles.codeBlock}>{`{
  "action": "onchat",
  "data": {
    "event": "LOGIN",
    "data": {
      "user": "long",
      "pass": "12345"
    }
  }
}`}</pre>
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
    wsInfo: {
        padding: '12px',
        background: '#e7f3ff',
        border: '1px solid #b3d9ff',
        borderRadius: '8px',
        marginBottom: '20px',
        fontSize: '13px',
        color: '#004085'
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
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '10px',
        marginBottom: '20px'
    },
    button: {
        padding: '12px 16px',
        border: 'none',
        borderRadius: '8px',
        fontSize: '13px',
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
    testButton: {
        background: '#6f42c1',
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
        alignItems: 'flex-start'
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
        flex: 1,
        wordBreak: 'break-word'
    },
    info: {
        background: '#e7f3ff',
        border: '1px solid #b3d9ff',
        borderRadius: '8px',
        padding: '20px',
        marginBottom: '20px'
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
    },
    apiInfo: {
        background: '#f8f9fa',
        border: '1px solid #dee2e6',
        borderRadius: '8px',
        padding: '20px'
    },
    codeBlock: {
        background: '#2d2d2d',
        color: '#f8f8f2',
        padding: '15px',
        borderRadius: '6px',
        overflow: 'auto',
        fontSize: '12px',
        margin: '10px 0 0 0'
    }
};

export default WebSocketTest;