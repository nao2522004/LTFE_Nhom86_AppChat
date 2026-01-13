import React from "react";
import styles from "./ChatWindow.module.css";
import {MessageStatus} from "../../../../shared/types/chat";
import { parseMessage } from "../../../../shared/utils/messageParser"; 
import ImageMessage from "../ChatInputWithImage/ImageMessage";

interface MessageProps {
    text: string;
    time: string;
    isSent: boolean;
    status?: MessageStatus;
}

const MessageBubble: React.FC<MessageProps> = ({text, time, isSent, status}) => {
    const parsedContent = parseMessage(text);
    const hasImages = parsedContent.imageUrls && parsedContent.imageUrls.length > 0;
    const statusElement = isSent && status && (
        <span 
            className="message-status-indicator"
            style={{
                fontSize: '11px',
                marginLeft: '6px',
                opacity: 0.8,
                display: 'inline-block',
                verticalAlign: 'middle',
                userSelect: 'none'
            }}
        >
            {status === 'sending' && <span title="Đang gửi...">⏳</span>}
            {status === 'sent' && <span title="Đã gửi">✓</span>}
            {status === 'failed' && <span title="Gửi thất bại" style={{ color: '#ff6b6b' }}>❌</span>}
        </span>
    );

    return (
        <div className={`${styles.message} ${isSent ? styles.sent : styles.received}`}>
            <div className={styles.msgBubble}>
                {parsedContent.text && (
                    <div style={{ 
                        marginBottom: hasImages ? '8px' : '0',
                        wordBreak: 'break-word',
                        lineHeight: '1.4'
                    }}>
                        {parsedContent.text}
                        {!hasImages && statusElement}
                    </div>
                )}

                {hasImages && (
                    <div className="message-images-container">
                        <ImageMessage imageUrls={parsedContent.imageUrls!} />
                        
                        {isSent && (
                            <div style={{ 
                                textAlign: 'right', 
                                marginTop: '4px',
                                lineHeight: '1' 
                            }}>
                                {statusElement}
                            </div>
                        )}
                    </div>
                )}
            </div>
            <span className={styles.msgTime}>{time}</span>
        </div>
    );
};

export default MessageBubble;