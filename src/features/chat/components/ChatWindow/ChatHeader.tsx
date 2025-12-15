import React from "react";
import styles from "./ChatWindow.module.css";

const ChatHeader: React.FC = () => {
    return (
        <div className={styles.chatHeader}>
            <div className={styles.headerUser}>
                <img src="https://i.pravatar.cc/150?img=3" alt="Anil" />
                <div className={styles.userStatus}>
                    <h3>Anil</h3>
                    <span>Online - Last seen, 2:02pm</span>
                </div>
            </div>
            <div className={styles.headerIcons}>
                <i className="fas fa-phone-alt"></i>
                <i className="fas fa-video"></i>
                <i className="fas fa-ellipsis-v"></i>
            </div>
        </div>
    );
};

export default ChatHeader;