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
                        fontSize: '11px',
                        marginLeft: '8px',
                        opacity: 0.8,
                        display: 'inline-flex',
                        alignItems: 'center'
                    }}>
                        {status === 'sending' && (
                            <span title="Đang gửi...">⏳</span>
                        )}
                        {status === 'sent' && (
                            <span title="Đã gửi">✓</span>
                        )}
                        {status === 'failed' && (
                            <span title="Gửi thất bại" style={{ color: '#ff6b6b' }}>❌</span>
                        )}
                    </span>
                )}
            </div>
            <span className={styles.msgTime}>{time}</span>
        </div>
    );
};

export default MessageBubble;