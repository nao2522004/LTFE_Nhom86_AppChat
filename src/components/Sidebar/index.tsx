import React from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Sidebar.module.css";
import { useAppDispatch } from "../../hooks/hooks";
import { logout } from "../../features/auth/authSlice";

const Sidebar: React.FC = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await dispatch(logout());
    };

    return (
        <div className={styles.sidebar}>
            <div className={styles.userProfile}>
                <img src="https://i.pravatar.cc/150?img=5" alt="My Profile" />
            </div>
            <div className={styles.navMenu}>
                <div className={styles.navItem}><i className="fas fa-home"></i></div>
                <div className={styles.navItem} onClick={() => navigate('/profile')}><i className="fas fa-user"></i></div>
                <div className={[styles.navItem, styles.active].join(' ')}><i className="fas fa-comment-dots"></i></div>
                <div className={styles.navItem}><i className="fas fa-bell"></i></div>
                <div className={styles.navItem}><i className="fas fa-cog"></i></div>
            </div>
            <div className={[styles.navItem, styles.logoutBtn].join(' ')} onClick={handleLogout}>
                <i className="fas fa-sign-out-alt"></i>
            </div>
        </div>
    );
};

export default Sidebar;