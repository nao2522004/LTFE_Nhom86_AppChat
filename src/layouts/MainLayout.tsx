import React from "react";
import { Outlet } from "react-router-dom";
import styles from "./MainLayout.module.css";
import Sidebar from "../components/Sidebar";

const MainLayout: React.FC = () => {
    return (
        <div className={styles.appContainer}>
            {/* Sidebar */}
            <Sidebar />

            {/* Outlet */}
            <div className={styles.outletContainer}>
                <Outlet />
            </div>
        </div>
    );
};

export default MainLayout;