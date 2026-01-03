import React, { useEffect, useRef, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../../../hooks/hooks';
import {
    selectActiveRoomMessages,
    selectActiveRoom,
    selectChatError,
    selectChatLoading,
    selectCurrentPage,
    selectHasMoreMessages,
    sendChatMessage,
    getRoomMessages,
    getPeopleMessages
} from '../chatSlice';
import { selectIsConnected } from '../../socket/socketSlice';
import ChatWindowView from '../components/ChatWindow/ChatWindowView';

/**
 * CONTROLLER
 * Chứa toàn bộ logic, Redux connections
 * Không chứa UI
 */
const ChatWindowContainer: React.FC = () => {
    const dispatch = useAppDispatch();
    const chatBodyRef = useRef<HTMLDivElement>(null);

    // ========== SELECTORS (Đọc từ MODEL) ==========
    const messages = useAppSelector(selectActiveRoomMessages);
    const activeRoom = useAppSelector(selectActiveRoom);
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
        if (!activeRoom || !isConnected) {
            console.error('Cannot send message: no active room or not connected');
            return;
        }

        try {
            await dispatch(sendChatMessage({
                type: activeRoom.type === 'group' ? 'room' : 'people',
                to: activeRoom.name,
                mes: text
            }));
        } catch (error) {
            console.error('Failed to send message:', error);
        }
    }, [dispatch, activeRoom, isConnected]);

    const handleLoadMore = useCallback(async () => {
        if (!activeRoom || !hasMoreMessages || loading) return;

        const nextPage = currentPage + 1;

        if (activeRoom.type === 'group') {
            await dispatch(getRoomMessages({
                name: activeRoom.name,
                page: nextPage
            }));
        } else {
            await dispatch(getPeopleMessages({
                name: activeRoom.name,
                page: nextPage
            }));
        }
    }, [dispatch, activeRoom, hasMoreMessages, loading, currentPage]);

    // ========== RENDER VIEW ==========
    return (
        <ChatWindowView
            // Data
            activeRoom={activeRoom}
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

export default ChatWindowContainer;