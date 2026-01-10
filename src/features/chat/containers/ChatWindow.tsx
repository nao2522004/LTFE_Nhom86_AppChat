import React, {useEffect, useRef, useCallback, useMemo, useState} from 'react';
import {useAppDispatch, useAppSelector} from '../../../hooks/hooks';
import {
    selectActiveConversation,
    selectActiveConversationMessages
} from '../../../shared/types/selectors';

import {
    getPeopleMessages,
    getRoomMessages,
    sendChatMessage,
} from '../chatThunks';

import {
    selectMessagesError,
    selectMessagesLoading, selectMessagesPagination
} from '../../ui/uiSlice';

import {selectIsConnected} from '../../socket/socketSlice';

import ChatWindowView from '../components/ChatWindow/ChatWindowView';

/**
 * CONTROLLER
 * Chứa toàn bộ logic, Redux connections
 * Không chứa UI
 */
const ChatWindow: React.FC = () => {
    const dispatch = useAppDispatch();
    const chatBodyRef = useRef<HTMLDivElement>(null);

    const messages = useAppSelector(selectActiveConversationMessages);
    const activeConversation = useAppSelector(selectActiveConversation);
    const loading = useAppSelector(selectMessagesLoading);
    const error = useAppSelector(selectMessagesError);
    const { currentPage, hasMore } = useAppSelector(selectMessagesPagination);
    const isConnected = useAppSelector(selectIsConnected);
    const currentUser = useAppSelector((state) => state.auth.user);
    const [sendError, setSendError] = useState<string | null>(null);

    const currentUsername = useMemo(() => {
        return currentUser?.username || null;
    }, [currentUser]);

    // Auto scroll khi có message mới
    useEffect(() => {
        if (chatBodyRef.current) {
            chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSendMessage = useCallback(async (text: string) => {
        if (!activeConversation || !isConnected) {
            return;
        }
        setSendError(null);
        try {
            await dispatch(sendChatMessage({
                type: activeConversation.type === 'room' ? 'room' : 'people',
                to: activeConversation.name,
                mes: text
            })).unwrap();
        } catch (error: any) {
            console.error('Failed to send message:', error);
            const errorMsg = error.message?.toLowerCase() || '';
            if (errorMsg.includes('not found') ||
                errorMsg.includes('không tồn tại') ||
                errorMsg.includes('user does not exist')) {
                setSendError(`Không thể gửi tin: ${activeConversation.name} không tồn tại hoặc đã bị xóa`);
            } else if (errorMsg.includes('timeout') || errorMsg.includes('network')) {
                setSendError('Lỗi kết nối. Vui lòng kiểm tra internet và thử lại.');
            } else if (errorMsg.includes('blocked') || errorMsg.includes('chặn')) {
                setSendError('Bạn đã bị chặn bởi người dùng này.');
            } else {
                setSendError('Không thể gửi tin nhắn. Vui lòng thử lại.');
            }
        }
    }, [dispatch, activeConversation, isConnected]);

    const handleLoadMore = useCallback(async () => {
        if (!activeConversation || !hasMore || loading) return;

        const nextPage = currentPage + 1;

        if (activeConversation.type === 'room') {
            await dispatch(getRoomMessages({
                name: activeConversation.name,
                page: nextPage
            }));
        } else {
            await dispatch(getPeopleMessages({
                name: activeConversation.name,
                page: nextPage
            }));
        }
    }, [dispatch, activeConversation, hasMore, loading, currentPage]);

    const handleClearSendError = useCallback(() => {
        setSendError(null);
    }, []);

    return (
        <ChatWindowView
            // Data
            activeConversation={activeConversation}
            messages={messages}
            currentUsername={currentUsername}

            // States
            loading={loading}
            error={error}
            sendError={sendError}
            isConnected={isConnected}
            hasMoreMessages={hasMore}

            // Handlers
            onSendMessage={handleSendMessage}
            onLoadMore={handleLoadMore}
            onClearSendError={handleClearSendError}

            // Refs
            chatBodyRef={chatBodyRef}
        />
    );
};

export default ChatWindow;