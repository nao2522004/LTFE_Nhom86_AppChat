import React, {useEffect} from "react";
import ConversationList from "../features/chat/components/ConversationList";
import ChatWindow from "../features/chat/components/ChatWindow";
import {useAppDispatch, useAppSelector} from "../hooks/hooks";
import {getUserList} from "../features/chat/chatSlice";

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
            <ConversationList />
            <ChatWindow />
        </>
    );
};

export default ChatPage;