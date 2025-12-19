import React, { useState } from "react";
import styles from "./ChatWindow.module.css";

interface Props {
    onSendMessage: (text: string) => void;
    disabled?: boolean;
}

const ChatInput: React.FC<Props> = ({ onSendMessage, disabled = false }) => {
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
                <i className={`fas fa-paperclip ${styles.attachIcon}`}></i>
                <input
                    type="text"
                    placeholder={disabled ? "Connecting..." : "Type your message here..."}
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onKeyDown={handleKeyPress}
                    disabled={disabled}
                />
                <i className={`far fa-laugh ${styles.emojiIcon}`}></i>
                <i className={`fas fa-camera ${styles.cameraIcon}`}></i>
            </div>
            <button
                className={styles.micBtn}
                onClick={handleSend}
                disabled={disabled || !text.trim()}
                style={{ opacity: disabled ? 0.5 : 1 }}
            >
                <i className={`fas ${text.trim() ? 'fa-paper-plane' : 'fa-microphone'}`}></i>
            </button>
        </div>
    );
};

export default ChatInput;