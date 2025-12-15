import React from "react";
import styles from "./ChatWindow.module.css";

interface MessageProps {
    text: string;
    time: string;
    isSent: boolean;
}

const MessageBubble: React.FC<MessageProps> = ({ text, time, isSent }) => {
    return (
        <div className={`${styles.message} ${isSent ? styles.sent : styles.received}`}>
            <div className={styles.msgBubble}>{text}</div>
            <span className={styles.msgTime}>{time}</span>
        </div>
    );
};

export default MessageBubble;