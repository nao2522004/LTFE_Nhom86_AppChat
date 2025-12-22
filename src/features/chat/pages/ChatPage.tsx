import ConversationListContainer from "../containers/ConversationListContainer";
import ChatWindowContainer from "../containers/ChatWindowContainer";

/**
 * PAGE
 * Chỉ chứa layout và gọi containers
 */
const ChatPage: React.FC = () => {
    return (
        <>
            <ConversationListContainer />
            <ChatWindowContainer />
        </>
    );
};

export default ChatPage;