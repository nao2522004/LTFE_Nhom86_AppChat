import React, { useState } from "react";
import styles from "./ChatWindow.module.css";

interface MessageInputBarProps {
    onSendMessage: (text: string) => void;
    disabled?: boolean;
}

const MessageInputBar: React.FC<MessageInputBarProps> = ({
                                                             onSendMessage,
                                                             disabled = false
                                                         }) => {
    const [text, setText] = useState('');

    const handleSend = () => {
        if (text.trim() && !disabled) {
            onSendMessage(text);
            setText('');
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className={styles.chatFooter}>
            <div className={styles.inputWrapper}>
                <button
                    className={styles.iconBtn}
                    disabled={disabled}
                    title="Attach file"
                >
                    <i className="fas fa-paperclip"></i>
                </button>

                <input
                    type="text"
                    placeholder={disabled ? "Connecting..." : "Type your message here..."}
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onKeyDown={handleKeyPress}
                    disabled={disabled}
                    className={styles.messageInput}
                />

                <button
                    className={styles.iconBtn}
                    disabled={disabled}
                    title="Emoji"
                >
                    <i className="far fa-laugh"></i>
                </button>

                <button
                    className={styles.iconBtn}
                    disabled={disabled}
                    title="Camera"
                >
                    <i className="fas fa-camera"></i>
                </button>
            </div>

            <button
                className={`${styles.sendBtn} ${(!text.trim() || disabled) ? styles.disabled : ''}`}
                onClick={handleSend}
                disabled={disabled || !text.trim()}
                title={text.trim() ? "Send message" : "Microphone"}
            >
                <i className={`fas ${text.trim() ? 'fa-paper-plane' : 'fa-microphone'}`}></i>
            </button>
        </div>
    );
};

export default MessageInputBar;