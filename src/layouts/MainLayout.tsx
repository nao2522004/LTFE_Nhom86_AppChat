import React from "react";
import { Outlet } from "react-router-dom";
import styles from "./MainLayout.module.css";
import Sidebar from "../components/Sidebar";
import SocketStatusBar from "../features/connectionSocket/components/SocketStatusBar";
import {useAppSelector} from "../hooks/hooks";
import {selectConnectionStatus} from "../features/connectionSocket/connectionSlice";
import SocketStatusIndicator from "../features/connectionSocket/components/SocketStatusIndicator";

const MainLayout: React.FC = () => {
    const connectionStatus = useAppSelector(selectConnectionStatus);
    const isConnected = connectionStatus === 'connected';

    return (
        <div className={styles.appContainer}>
            {/* Thanh trạng thái bay lơ lửng */}
            {!isConnected && <SocketStatusBar />}

            {/* Sideba */}
            <Sidebar />

            <div className={styles.outletContainer}>
                {/* Indicator ở góc nhỏ gọn */}
                {isConnected && (
                    <div style={{ position: 'absolute', top: '15px', right: '15px', zIndex: 99 }}>
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