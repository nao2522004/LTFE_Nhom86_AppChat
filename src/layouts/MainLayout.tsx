import React from "react";
import { Outlet } from "react-router-dom";
import { useAppSelector } from "../hooks/hooks";
import { selectConnectionStatus } from "../features/connection/connectionSlice";
import styles from "./MainLayout.module.css";
import Sidebar from "../components/Sidebar";
import SocketIndicator from "../components/SocketIndicator/SocketIndicator";

const MainLayout: React.FC = () => {
    const connectionStatus = useAppSelector(selectConnectionStatus);

    return (
        <div className={styles.appContainer}>
            {/* Connection Status Banner */}
            {connectionStatus !== 'connected' && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    padding: '10px',
                    background: connectionStatus === 'reconnecting' ? '#fff3cd' : '#f8d7da',
                    color: connectionStatus === 'reconnecting' ? '#856404' : '#721c24',
                    textAlign: 'center',
                    zIndex: 9999,
                    fontSize: '14px',
                    fontWeight: 500
                }}>
                    {connectionStatus === 'reconnecting'
                        ? 'Reconnecting to server...'
                        : 'Disconnected from server'
                    }
                </div>
            )}

            {/* Sidebar */}
            <Sidebar />

            {/* Main Content */}
            <div className={styles.outletContainer}>
                {/* Socket Indicator in corner */}
                <div style={{
                    position: 'absolute',
                    top: '20px',
                    right: '20px',
                    zIndex: 100
                }}>
                    <SocketIndicator />
                </div>

                <Outlet />
            </div>
        </div>
    );
};


export default MainLayout;