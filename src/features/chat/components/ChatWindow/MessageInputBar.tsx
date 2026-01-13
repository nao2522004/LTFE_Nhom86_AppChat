import React, { useState, useRef, useEffect } from "react";
import styles from "./ChatWindow.module.css";
import EmojiPicker from "../EmojiPicker/EmojiPicker";

interface MessageInputBarProps {
    onSendMessage: (text: string) => void;
    disabled?: boolean;
}

const MessageInputBar: React.FC<MessageInputBarProps> = ({
                                                             onSendMessage,
                                                             disabled = false
                                                         }) => {
    const [text, setText] = useState('');
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const cursorPositionRef = useRef<number | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleInputSelect = (e: React.SyntheticEvent<HTMLInputElement>) => {
        cursorPositionRef.current = e.currentTarget.selectionStart;
    };

    const handleSend = () => {
        if (text.trim() && !disabled) {
            onSendMessage(text);
            setText('');
            setShowEmojiPicker(false);
            cursorPositionRef.current = null;
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleEmojiSelect = (emoji: string) => {
        setText((prevText) => {
            const cursorPos = cursorPositionRef.current !== null 
                ? cursorPositionRef.current 
                : prevText.length;

            const before = prevText.substring(0, cursorPos);
            const after = prevText.substring(cursorPos);
            
            cursorPositionRef.current = cursorPos + emoji.length;

            return before + emoji + after;
        });

        setTimeout(() => {
            if (inputRef.current && cursorPositionRef.current !== null) {
                inputRef.current.focus();
                inputRef.current.setSelectionRange(cursorPositionRef.current, cursorPositionRef.current);
            }
        }, 0);
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
                    ref={inputRef}
                    type="text"
                    placeholder={disabled ? "Connecting..." : "Type your message here..."}
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onSelect={handleInputSelect}
                    onKeyDown={handleKeyPress}
                    disabled={disabled}
                    className={styles.messageInput}
                />

                {/* Emoji picker */}
                <div style={{ position: 'relative' }}>
                    <button
                        className={`${styles.iconBtn} ${showEmojiPicker ? styles.active : ''}`}
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                        disabled={disabled}
                    >
                        <i className="far fa-smile"></i>
                    </button>

                    {showEmojiPicker && (
                        <EmojiPicker
                            onEmojiSelect={handleEmojiSelect}
                            disabled={disabled}
                            onClose={() => setShowEmojiPicker(false)}
                        />
                    )}
                </div>

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