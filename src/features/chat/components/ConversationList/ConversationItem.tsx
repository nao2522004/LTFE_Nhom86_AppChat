import React from "react";
import styles from "./ConversationList.module.css";

interface ConversationProps {
    avatar: string;
    name: string;
    lastMessage: string;
    time: string;
    unreadCount?: number;
    isActive?: boolean;
    isOnline?: boolean;
}

const ConversationItem: React.FC<ConversationProps> = ({ avatar, name, lastMessage, time, unreadCount, isActive, isOnline }) => {
    return (
        <div className={`${styles.chatItem} ${isActive ? styles.active : ''}`}>
            <img src={avatar} alt={name} className={styles.avatar} />
            <div className={styles.chatInfo}>
                <div className={styles.chatName}>{name}</div>
                <span className={styles.chatPreview}>{lastMessage}</span>
            </div>
            <div className={styles.chatMeta}>
                <span>{time}</span>
                {unreadCount ? (
                    <span className={styles.badge}>{unreadCount}</span>
                ) : isOnline ? (
                    <span className={`${styles.badge} ${styles.checkDouble}`}>
                        <i className="fas fa-check-double"></i>
                    </span>
                ) : null}
            </div>
        </div>
    );
};

export default ConversationItem;