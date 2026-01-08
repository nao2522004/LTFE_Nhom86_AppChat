import React, {useEffect, useRef, useCallback, useMemo} from 'react';
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

    const currentUsername = useMemo(() => {
        if (!activeConversation || messages.length === 0) {
            return null;
        }
        const activeId = activeConversation.id;
        // Tìm message được GỬI ĐẾN activeConversation
        // → Sender của message đó là current user
        const sentMessage = messages.find(m =>
            m.receiver.id === activeId || m.receiver.name === activeId
        );

        if (sentMessage) {
            console.log('Current user identified from SENT message:', sentMessage.sender.username);
            return sentMessage.sender.username;
        }
        // Fallback: Tìm message NHẬN TỪ activeConversation
        // → Receiver là current user
        const receivedMessage = messages.find(m =>
            m.sender.id === activeId || m.sender.username === activeId
        );

        if (receivedMessage) {
            console.log('Current user identified from RECEIVED message:', receivedMessage.receiver.name);
            return receivedMessage.receiver.name;
        }

        console.warn('Cannot identify current user');
        return null;
    }, [messages, activeConversation]);

    // Debug log
    useEffect(() => {
        console.log('ChatWindow Debug:', {
            currentUsername,
            activeConversationId: activeConversation?.id,
            messagesCount: messages.length,
            firstMessage: messages[0] ? {
                sender: messages[0].sender.username,
                receiver: messages[0].receiver.name
            } : null
        });
    }, [currentUsername, activeConversation, messages]);

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
            currentUsername={currentUsername}

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