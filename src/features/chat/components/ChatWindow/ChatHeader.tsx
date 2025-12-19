import React from "react";
import styles from "./ChatWindow.module.css";

interface ChatHeaderProps {
    name: string;
    avatar: string;
    isOnline: boolean;
    lastSeen: string;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({ name, avatar, isOnline, lastSeen }) => {
    return (
        <div className={styles.chatHeader}>
            <div className={styles.headerUser}>
                <img src={avatar} alt={name} />
                <div className={styles.userStatus}>
                    <h3>{name}</h3>
                    <span>
                        {isOnline ? 'Online' : `Last seen, ${lastSeen}`}
                    </span>
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