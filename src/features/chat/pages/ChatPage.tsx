import ConversationSidebar from "../containers/ConversationSidebar";
import ChatWindow from "../containers/ChatWindow";

/**
 * PAGE
 * Chỉ chứa layout và gọi containers
 */
const ChatPage: React.FC = () => {
    return (
        <>
            <ConversationSidebar />
            <ChatWindow />
        </>
    );
};

export default ChatPage;