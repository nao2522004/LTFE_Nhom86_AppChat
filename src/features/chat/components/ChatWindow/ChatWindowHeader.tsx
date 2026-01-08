import React from "react";
import styles from "./ChatWindow.module.css";

interface ChatWindowHeaderProps {
    name: string;
    avatar: string;
    isOnline: boolean;
    lastSeen: string;
}

const ChatWindowHeader: React.FC<ChatWindowHeaderProps> = ({
                                                               name,
                                                               avatar,
                                                               isOnline,
                                                               lastSeen
                                                           }) => {
    return (
        <div className={styles.chatHeader}>
            <div className={styles.headerUser}>
                {avatar ? (<img src={avatar} alt={name} className={styles.headerAvatar}/>) : (
                    <div className={styles.headerAvatarIcon}>
                        <i className="fas fa-user"></i>
                    </div>
                )}
                <div className={styles.userStatus}>
                    <h3>{name}</h3>
                    <span className={styles.statusText}>
                        {isOnline ? (
                            <>
                                <span className={styles.onlineDot}></span>
                                Online
                            </>
                        ) : (
                            `Last seen, ${lastSeen}`
                        )}
                    </span>
                </div>
            </div>
            <div className={styles.headerIcons}>
                <i className="fas fa-phone-alt" title="Voice Call"></i>
                <i className="fas fa-video" title="Video Call"></i>
                <i className="fas fa-ellipsis-v" title="More Options"></i>
            </div>
        </div>
    );
};

export default ChatWindowHeader;