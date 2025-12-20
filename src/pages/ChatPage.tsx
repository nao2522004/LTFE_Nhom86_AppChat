import React, {useEffect} from "react";
import {useAppDispatch, useAppSelector} from "../hooks/hooks";
import {getUserList} from "../features/chat/chatSlice";
import ConversationListContainer from "../features/chat/containers/ConversationListContainer";
import ChatWindowContainer from "../features/chat/containers/ChatWindowContainer";

/**
 * PAGE
 * Chỉ chứa layout và gọi containers
 */
const ChatPage: React.FC = () => {
    const dispatch = useAppDispatch();
    const { isAuthenticated } = useAppSelector((state) => state.auth);

    // Load initial data when page mounts
    useEffect(() => {
        if (isAuthenticated) {
            // Load user list for conversations
            dispatch(getUserList());
        }
    }, [dispatch, isAuthenticated]);

    return (
        <>
            <ConversationListContainer />
            <ChatWindowContainer />
        </>
    );
};

export default ChatPage;