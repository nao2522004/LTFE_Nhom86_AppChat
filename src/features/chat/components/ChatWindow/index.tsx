import React, {useEffect, useRef, useState} from "react";
import ChatHeader from "./ChatHeader";
import MessageBubble from "./MessageBubble";
import ChatInput from "./ChatInput";
import styles from "./ChatWindow.module.css";
import {useAppDispatch, useAppSelector} from "../../../../hooks/hooks";
import {
    getPeopleMessages,
    getRoomMessages,
    selectActiveRoom,
    selectActiveRoomMessages,
    selectChatError, selectChatLoading,
    selectCurrentPage,
    selectHasMoreMessages, sendChatMessage
} from "../../chatSlice";
import {selectIsConnected} from "../../../connection/connectionSlice";

const ChatWindow: React.FC = () => {
    const dispatch = useAppDispatch();
    const chatBodyRef = useRef<HTMLDivElement>(null);

    // ② ĐỌC state từ chatSlice
    const messages = useAppSelector(selectActiveRoomMessages);
    const activeRoom = useAppSelector(selectActiveRoom);
    const loading = useAppSelector(selectChatLoading);
    const error = useAppSelector(selectChatError);
    const currentPage = useAppSelector(selectCurrentPage);
    const hasMoreMessages = useAppSelector(selectHasMoreMessages);

    // ② ĐỌC state từ connectionSlice
    const isConnected = useAppSelector(selectIsConnected);

    // ② ĐỌC user từ authSlice
    const currentUser = useAppSelector((state) => state.auth.user);

    // Auto scroll to bottom when new messages arrive
    useEffect(() => {
        if (chatBodyRef.current) {
            chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
        }
    }, [messages]);

    // ① GỬI tin nhắn
    const handleSendMessage = async (text: string) => {
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
    };

    // ① LOAD more messages (pagination)
    const handleLoadMore = async () => {
        if (!activeRoom || !hasMoreMessages || loading) return;

        const nextPage = currentPage + 1;

        if (activeRoom.type === 'group') {
            await dispatch(getRoomMessages({
                roomName: activeRoom.name,
                page: nextPage
            }));
        } else {
            await dispatch(getPeopleMessages({
                userName: activeRoom.name,
                page: nextPage
            }));
        }
    };

    if (!activeRoom) {
        return (
            <div className={styles.chatPanel}>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100%',
                    color: '#999'
                }}>
                    Select a conversation to start chatting
                </div>
            </div>
        );
    }

    return (
        <div className={styles.chatPanel}>
            {/* Header */}
            <ChatHeader
                name={activeRoom.name}
                avatar="https://i.pravatar.cc/150?img=3"
                isOnline={true}
                lastSeen="2:02pm"
            />

            {/* Body */}
            <div className={styles.chatBody} ref={chatBodyRef}>
                {/* Connection Warning */}
                {!isConnected && (
                    <div style={{
                        padding: '10px',
                        background: '#fff3cd',
                        borderRadius: '8px',
                        marginBottom: '10px',
                        textAlign: 'center',
                        color: '#856404'
                    }}>
                            Disconnected. Trying to reconnect...
                    </div>
                )}

                {/* Error */}
                {error && (
                    <div style={{
                        padding: '10px',
                        background: '#f8d7da',
                        borderRadius: '8px',
                        marginBottom: '10px',
                        textAlign: 'center',
                        color: '#721c24'
                    }}>
                            {error}
                    </div>
                )}

                {/* Load More Button */}
                {hasMoreMessages && messages.length > 0 && (
                    <div style={{ textAlign: 'center', marginBottom: '10px' }}>
                        <button
                            onClick={handleLoadMore}
                            disabled={loading}
                            style={{
                                padding: '8px 16px',
                                background: '#5d8e85',
                                color: 'white',
                                border: 'none',
                                borderRadius: '20px',
                                cursor: 'pointer',
                                fontSize: '12px'
                            }}
                        >
                            {loading ? 'Loading...' : 'Load more messages'}
                        </button>
                    </div>
                )}

                {/* Messages */}
                {messages.length === 0 && !loading && (
                    <div style={{ textAlign: 'center', color: '#999', marginTop: '20px' }}>
                        No messages yet. Start the conversation!
                    </div>
                )}

                {messages.map((msg) => (
                    <MessageBubble
                        key={msg.id}
                        text={msg.content}
                        time={new Date(msg.timestamp).toLocaleTimeString()}
                        isSent={msg.sender.id === currentUser?.id || msg.sender.username === currentUser?.username}
                        status={msg.status}
                    />
                ))}

                {loading && messages.length === 0 && (
                    <div style={{ textAlign: 'center', color: '#999' }}>
                        Loading messages...
                    </div>
                )}
            </div>

            {/* Footer */}
            <ChatInput
                onSendMessage={handleSendMessage}
                disabled={!isConnected}
            />
        </div>
    );
};

export default ChatWindow;