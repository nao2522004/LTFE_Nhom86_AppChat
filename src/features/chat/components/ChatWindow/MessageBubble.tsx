import React from "react";
import styles from "./ChatWindow.module.css";
import {MessageStatus} from "../../../../shared/types/chat";

interface MessageProps {
    text: string;
    time: string;
    isSent: boolean;
    status?: MessageStatus;
}

const MessageBubble: React.FC<MessageProps> = ({text, time, isSent, status}) => {
    return (
        <div className={`${styles.message} ${isSent ? styles.sent : styles.received}`}>
            <div className={styles.msgBubble}>
                {text}
                {/* Show status for sent messages */}
                {isSent && status && (
                    <span style={{
                        fontSize: '10px',
                        marginLeft: '8px',
                        opacity: 0.7
                    }}>
                        {status === 'sending' && '⏳'}
                        {status === 'sent' && '✓'}
                        {status === 'failed' && '❌'}
                    </span>
                )}
            </div>
            <span className={styles.msgTime}>{time}</span>
        </div>
    );
};

export default MessageBubble;