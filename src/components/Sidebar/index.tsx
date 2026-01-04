import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import styles from "./Sidebar.module.css";
import { useAppDispatch } from "../../hooks/hooks";
import { logout } from "../../features/auth/authSlice";

const MENU_ITEMS = [
    { path: '/dashboard', icon: 'fas fa-home', label: 'Home' },
    { path: '/profile', icon: 'fas fa-user', label: 'Profile' },
    { path: '/chat', icon: 'fas fa-comment-dots', label: 'Chat' },
    { path: '/notifications', icon: 'fas fa-bell', label: 'Notifications' },
    { path: 'settings', icon: 'fas fa-cog', label: 'Settings' },
];

const Sidebar: React.FC = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = async () => {
        await dispatch(logout());
    };

    const handleNavigate = (path: string) => {
        navigate(path);
    };

    const checkActive = (path: string) => {
        return location.pathname === path || location.pathname.startsWith(path);
    };

    return (
        <div className={styles.sidebar}>
            <div className={styles.userProfile}>
                <img src="https://i.pravatar.cc/150?img=5" alt="My Profile" />
            </div>
            <div className={styles.navMenu}>
                {MENU_ITEMS.map((item, index) => {
                    const isActive = checkActive(item.path)

                    return (
                        <div
                            key={index}
                            className={`${styles.navItem} ${isActive ? styles.active : ''}`}
                            onClick={() => handleNavigate(item.path)}
                            title={item.label}
                        >
                            <i className={item.icon}></i>
                        </div>
                    );
                })}
            </div>
            
            <div className={[styles.navItem, styles.logoutBtn].join(' ')} onClick={handleLogout}>
                <i className="fas fa-sign-out-alt"></i>
            </div>
        </div>
    );
};

export default Sidebar;