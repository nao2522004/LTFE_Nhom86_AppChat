import React, {useEffect, useState} from "react";
import { Outlet } from "react-router-dom";
import styles from "./MainLayout.module.css";
import Sidebar from "../components/Sidebar";
import ConnectionStatusBar from "../features/socket/components/ConnectionStatusBar";
import {useAppSelector} from "../hooks/hooks";
import {selectSocketStatus} from "../features/socket/socketSlice";
import SocketStatusIndicator from "../features/socket/components/SocketStatusIndicator";

const MainLayout: React.FC = () => {
    const connectionStatus = useAppSelector(selectSocketStatus);

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
            {shouldShowStatusBar && <ConnectionStatusBar />}

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