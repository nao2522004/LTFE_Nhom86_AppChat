import React from "react";
import styles from "./Sidebar.module.css";

const Sidebar: React.FC = () => {
    return (
        <div className={styles.sidebar}>
            <div className={styles.userProfile}>
                <img src="https://i.pravatar.cc/150?img=5" alt="My Profile" />
            </div>
            <div className={styles.navMenu}>
                <div className={styles.navItem}><i className="fas fa-home"></i></div>
                <div className={[styles.navItem, styles.active].join(' ')}><i className="fas fa-comment-dots"></i></div>
                <div className={styles.navItem}><i className="fas fa-bell"></i></div>
                <div className={styles.navItem}><i className="fas fa-cog"></i></div>
            </div>
            <div className={[styles.navItem, styles.logoutBtn].join(' ')}>
                <i className="fas fa-sign-out-alt"></i>
            </div>
        </div>
    );
};

export default Sidebar;