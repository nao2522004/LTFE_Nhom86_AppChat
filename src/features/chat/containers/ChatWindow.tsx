import React, { useEffect, useRef, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../../../hooks/hooks';
import {
    selectActiveConversationMessages,
    selectActiveConversation,
    selectChatError,
    selectChatLoading,
    selectCurrentPage,
    selectHasMoreMessages,
    sendChatMessage,
    getGroupChatMessages,
    getPrivateChatMessages
} from '../chatSlice';
import { selectIsConnected } from '../../socket/connectionSlice';
import ChatWindowView from '../components/ChatWindow/ChatWindowView';

/**
 * CONTROLLER
 * Chứa toàn bộ logic, Redux connections
 * Không chứa UI
 */
const ChatWindow: React.FC = () => {
    const dispatch = useAppDispatch();
    const chatBodyRef = useRef<HTMLDivElement>(null);

    // ========== SELECTORS (Đọc từ MODEL) ==========
    const messages = useAppSelector(selectActiveConversationMessages);
    const activeConversation  = useAppSelector(selectActiveConversation);
    const loading = useAppSelector(selectChatLoading);
    const error = useAppSelector(selectChatError);
    const currentPage = useAppSelector(selectCurrentPage);
    const hasMoreMessages = useAppSelector(selectHasMoreMessages);
    const isConnected = useAppSelector(selectIsConnected);
    const currentUser = useAppSelector((state) => state.auth.user);

    // ========== EFFECTS ==========
    // Auto scroll khi có message mới
    useEffect(() => {
        if (chatBodyRef.current) {
            chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
        }
    }, [messages]);

    // ========== EVENT HANDLERS (CONTROLLER LOGIC) ==========
    const handleSendMessage = useCallback(async (text: string) => {
        if (!activeConversation || !isConnected) {
            console.error('Cannot send message: no active room or not connected');
            return;
        }

        try {
            await dispatch(sendChatMessage({
                type: activeConversation.type === 'group' ? 'room' : 'people',
                to: activeConversation.name,
                mes: text
            }));
        } catch (error) {
            console.error('Failed to send message:', error);
        }
    }, [dispatch, activeConversation, isConnected]);

    const handleLoadMore = useCallback(async () => {
        if (!activeConversation || !hasMoreMessages || loading) return;

        const nextPage = currentPage + 1;

        if (activeConversation.type === 'group') {
            await dispatch(getGroupChatMessages({
                name: activeConversation.name,
                page: nextPage
            }));
        } else {
            await dispatch(getPrivateChatMessages({
                name: activeConversation.name,
                page: nextPage
            }));
        }
    }, [dispatch, activeConversation, hasMoreMessages, loading, currentPage]);

    // ========== RENDER VIEW ==========
    return (
        <ChatWindowView
            // Data
            activeConversation={activeConversation}
            messages={messages}
            currentUser={currentUser}

            // States
            loading={loading}
            error={error}
            isConnected={isConnected}
            hasMoreMessages={hasMoreMessages}

            // Handlers
            onSendMessage={handleSendMessage}
            onLoadMore={handleLoadMore}

            // Refs
            chatBodyRef={chatBodyRef}
        />
    );
};

export default ChatWindow;