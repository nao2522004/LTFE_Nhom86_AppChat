import React, { useState } from "react";
import ChatHeader from "./ChatHeader";
import MessageBubble from "./MessageBubble";
import ChatInput from "./ChatInput";
import styles from "./ChatWindow.module.css";

const ChatWindow: React.FC = () => {
    const [messages, setMessages] = useState([
        { id: 1, text: "Hey there!", time: "Today, 8:30pm", isSent: false },
        { id: 2, text: "Hello!", time: "Today, 8:33pm", isSent: true },
    ]);

    const handleSendMessage = (text: string) => {
        const newMsg = {
            id: Date.now(),
            text: text,
            time: "Just now",
            isSent: true
        };
        setMessages([...messages, newMsg])
    };

    return (
        <div className={styles.chatPanel}>
            {/* Header */}
            <ChatHeader />

            {/* Body */}
            <div className={styles.chatBody}>
                {messages.map((msg) => (
                    <MessageBubble
                        key={msg.id}
                        text={msg.text}
                        time={msg.time}
                        isSent={msg.isSent}
                    />
                ))}
            </div>

            {/* Footer */}
            <ChatInput onSendMessage={handleSendMessage} />
        </div>
    );
};

export default ChatWindow;