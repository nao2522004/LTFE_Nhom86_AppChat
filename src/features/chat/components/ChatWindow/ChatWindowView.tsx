import React from 'react';
import ChatWindowHeader from './ChatWindowHeader';
import MessageBubble from './MessageBubble';
import MessageInputBar from './MessageInputBar';
import styles from './ChatWindow.module.css';
import { Conversation, Message } from '../../../../shared/types/chat';
import { User } from '../../../../shared/types/user';

interface ChatWindowViewProps {
    activeConversation: Conversation | null;
    messages: Message[];
    currentUser: User | null;
    loading: boolean;
    error: string | null;
    isConnected: boolean;
    hasMoreMessages: boolean;
    onSendMessage: (text: string) => void;
    onLoadMore: () => void;
    chatBodyRef: React.RefObject<HTMLDivElement>;
}

const ChatWindowView: React.FC<ChatWindowViewProps> = ({
                                                           activeConversation,
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
    // Empty State - No conversation selected
    if (!activeConversation) {
        return (
            <div className={styles.chatPanel}>
                <div className={styles.emptyState}>
                    <div className={styles.emptyIcon}>
                        <i className="fas fa-comments"></i>
                    </div>
                    <h3 className={styles.emptyTitle}>Welcome to Chat</h3>
                    <p className={styles.emptyText}>
                        Select a conversation from the left panel to start messaging
                    </p>
                    <div className={styles.emptyHint}>
                        <i className="fas fa-arrow-left"></i>
                        <span>Choose a conversation or start a new one</span>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.chatPanel}>
            {/* Header */}
            <ChatWindowHeader
                name={activeConversation.name}
                avatar="https://i.pravatar.cc/150?img=3"
                isOnline={true}
                lastSeen="2:02pm"
            />

            {/* Body - Messages Area */}
            <div className={styles.chatBody} ref={chatBodyRef}>
                {/* Connection Warning */}
                {!isConnected && (
                    <div className={styles.connectionWarning}>
                        <i className="fas fa-exclamation-triangle"></i>
                        <span>Disconnected. Trying to reconnect...</span>
                    </div>
                )}

                {/* Error Message */}
                {error && (
                    <div className={styles.errorMessage}>
                        <i className="fas fa-times-circle"></i>
                        <span>{error}</span>
                    </div>
                )}

                {/* Load More Button */}
                {hasMoreMessages && messages.length > 0 && (
                    <div className={styles.loadMoreContainer}>
                        <button
                            onClick={onLoadMore}
                            disabled={loading}
                            className={`${styles.loadMoreBtn} ${loading ? styles.disabled : ''}`}
                        >
                            {loading ? (
                                <>
                                    <i className="fas fa-spinner fa-spin"></i>
                                    <span>Loading...</span>
                                </>
                            ) : (
                                <>
                                    <i className="fas fa-chevron-up"></i>
                                    <span>Load older messages</span>
                                </>
                            )}
                        </button>
                    </div>
                )}

                {/* Messages List */}
                {messages.length === 0 && !loading ? (
                    <div className={styles.noMessages}>
                        <div className={styles.noMessagesIcon}>
                            <i className="fas fa-inbox"></i>
                        </div>
                        <p className={styles.noMessagesTitle}>No messages yet</p>
                        <p className={styles.noMessagesText}>
                            Start the conversation by sending the first message!
                        </p>
                    </div>
                ) : (
                    messages.map((msg) => (
                        <MessageBubble
                            key={msg.id}
                            text={msg.content}
                            time={new Date(msg.timestamp).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit'
                            })}
                            isSent={msg.sender.username === currentUser?.username}
                            status={msg.status}
                        />
                    ))
                )}

                {/* Initial Loading */}
                {loading && messages.length === 0 && (
                    <div className={styles.loadingMessages}>
                        <i className="fas fa-spinner fa-spin"></i>
                        <span>Loading messages...</span>
                    </div>
                )}
            </div>

            {/* Footer - Input Area */}
            <MessageInputBar onSendMessage={onSendMessage} disabled={!isConnected} />
        </div>
    );
};

export default ChatWindowView;