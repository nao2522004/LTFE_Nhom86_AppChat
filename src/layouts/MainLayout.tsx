import React, {useEffect, useState} from "react";
import { Outlet } from "react-router-dom";
import styles from "./MainLayout.module.css";
import Sidebar from "../components/Sidebar";
import SocketStatusBar from "../features/connectionSocket/components/SocketStatusBar";
import {useAppSelector} from "../hooks/hooks";
import {selectConnectionStatus} from "../features/connectionSocket/connectionSlice";
import SocketStatusIndicator from "../features/connectionSocket/components/SocketStatusIndicator";

const MainLayout: React.FC = () => {
    const connectionStatus = useAppSelector(selectConnectionStatus);

    // Delay hiển thị indicator
    const [showIndicator, setShowIndicator] = useState(false);

    useEffect(() => {
        // Delay 300ms trước khi hiển thị
        const timer = setTimeout(() => {
            setShowIndicator(true);
        }, 300);

        return () => clearTimeout(timer);
    }, []);

    // Status Bar: Hiện khi có vấn đề
    const shouldShowStatusBar =
        connectionStatus === 'disconnected' ||
        connectionStatus === 'reconnecting';

    // Indicator: Hiện sau delay
    const shouldShowIndicator = showIndicator;

    return (
        <div className={styles.appContainer}>
            {shouldShowStatusBar && <SocketStatusBar />}

            {/* Sideba */}
            <Sidebar />

            <div className={styles.outletContainer}>
                {shouldShowIndicator && (
                    <div
                        style={{
                            position: 'absolute',
                            top: '15px',
                            right: '15px',
                            zIndex: 99,
                            animation: 'fadeIn 0.3s ease-in'
                        }}
                    >
                        <SocketStatusIndicator />
                    </div>
                )}

                {/* Nội dung chính */}
                <Outlet />
            </div>
        </div>
    );
};

export default MainLayout;