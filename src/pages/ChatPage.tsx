import React from "react";
import ConversationList from "../features/chat/components/ConversationList";
import ChatWindow from "../features/chat/components/ChatWindow";

const ChatPage: React.FC = () => {
    return (
        <>
            <ConversationList />
            <ChatWindow />
        </>
    );
};

export default ChatPage;