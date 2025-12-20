import React from 'react';
import ChatHeader from './ChatHeader';
import MessageBubble from './MessageBubble';
import ChatInput from './ChatInput';
import styles from './ChatWindow.module.css';
import { Room, Message } from '../../../../types/chat';
import { User } from '../../../../types/user';

/**
 * VIEW (Presentational Component)
 * Chỉ nhận props và render UI
 * KHÔNG có logic, KHÔNG gọi Redux
 */
interface ChatWindowViewProps {
    // Data
    activeRoom: Room | null;
    messages: Message[];
    currentUser: User | null;

    // States
    loading: boolean;
    error: string | null;
    isConnected: boolean;
    hasMoreMessages: boolean;

    // Handlers
    onSendMessage: (text: string) => void;
    onLoadMore: () => void;

    // Refs
    chatBodyRef: React.RefObject<HTMLDivElement>;
}

const ChatWindowView: React.FC<ChatWindowViewProps> = ({
                                                           activeRoom,
                                                           messages,
                                                           currentUser,
                                                           loading,
                                                           error,
                                                           isConnected,
                                                           hasMoreMessages,
                                                           onSendMessage,
                                                           onLoadMore,
                                                           chatBodyRef
                                                       }) => {
    // ========== RENDER: Empty State ==========
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

    // ========== RENDER: Main Chat ==========
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
                            onClick={onLoadMore}
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
                onSendMessage={onSendMessage}
                disabled={!isConnected}
            />
        </div>
    );
};

export default ChatWindowView;