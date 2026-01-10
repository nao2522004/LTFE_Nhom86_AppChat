import React from 'react';
import styles from './ConversationSidebar.module.css';

interface Message {
    id: string;
    content: string;
    timestamp: string;
    sender: {
        username: string;
    };
}

interface Conversation {
    id: string;
    name: string;
    type: 'people' | 'room';
    lastMessage?: Message;
    unreadCount: number;
    updatedAt: string;
}

interface User {
    id: string;
    username: string;
    displayName?: string;
    avatar?: string;
    isOnline?: boolean;
    lastSeen?: string;
}

interface ConversationSidebarViewProps {
    conversations: Conversation[];
    users: User[];
    activeConversationId: string | null;
    loading: boolean;
    searchQuery: string;
    onSelectConversation: (id: string, type: 'room' | 'people', name: string) => void;
    onSearchChange: (value: string) => void;
    onOpenModal: () => void;
}

const ConversationSidebarView: React.FC<ConversationSidebarViewProps> = ({
                                                                             conversations,
                                                                             users,
                                                                             activeConversationId,
                                                                             loading,
                                                                             searchQuery,
                                                                             onSelectConversation,
                                                                             onSearchChange,
                                                                             onOpenModal
                                                                         }) => {
    // Utility functions
    const formatTime = (timestamp?: string) => {
        if (!timestamp) return '';

        const date = new Date(timestamp);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const hours = diff / (1000 * 60 * 60);

        if (hours < 24) {
            return date.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: false
            });
        } else if (hours < 48) {
            return 'Yesterday';
        } else {
            return date.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric'
            });
        }
    };

    const truncateMessage = (text: string, maxLength = 35) => {
        if (!text) return '';
        return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
    };

    // Filter conversations and users
    const filteredConversations = conversations.filter(conv =>
        conv.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const filteredUsers = users.filter(user =>
        (user.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.displayName?.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const peopleChats = filteredConversations.filter(c => c.type === 'people');
    const roomChats = filteredConversations.filter(c => c.type === 'room');

    return (
        <div className={styles.sidebarContainer}>
            {/* Search Box */}
            <div className={styles.searchBox}>
                <i className="fas fa-search"></i>
                <input
                    type="text"
                    placeholder="Search conversations..."
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                />
            </div>

            {/* New Conversation Button */}
            <button onClick={onOpenModal} className={styles.newChatBtn}>
                <i className="fas fa-plus"></i>
                <span>New Conversation</span>
            </button>

            {/* Loading State */}
            {loading && (
                <div className={styles.loadingContainer}>
                    <i className="fas fa-spinner fa-spin"></i>
                    <span>Loading...</span>
                </div>
            )}

            {/* Conversations List */}
            <div className={styles.conversationsList}>
                {/* Direct Messages Section */}
                {(filteredUsers.length > 0 || peopleChats.length > 0) && (
                    <div className={styles.section}>
                        <div className={styles.sectionHeader}>
                            <i className="fas fa-user"></i>
                            <span className={styles.sectionTitle}>Direct Messages</span>
                            <span className={styles.sectionCount}>
                {filteredUsers.length + peopleChats.length}
              </span>
                        </div>

                        <div className={styles.chatList}>
                            {/* Users from user list */}
                            {filteredUsers.map((user) => {
                                const isActive = user.id === activeConversationId ||
                                    user.username === activeConversationId;

                                return (
                                    <div
                                        key={user.id}
                                        onClick={() => onSelectConversation(
                                            user.username,
                                            'people',
                                            user.username
                                        )}
                                        className={`${styles.chatItem} ${isActive ? styles.active : ''}`}
                                    >
                                        <div className={styles.avatarContainer}>
                                            <img
                                                src={user.avatar || `https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y?u=${user.username}`}
                                                alt={user.username}
                                                className={styles.avatar}
                                            />
                                            {user.isOnline && <div className={styles.onlineIndicator} />}
                                        </div>

                                        <div className={styles.chatContent}>
                                            <div className={styles.chatHeader}>
                        <span className={styles.chatName}>
                          {user.displayName || user.username}
                        </span>
                                                <span className={styles.chatTime}>
                          {user.isOnline ? 'Online' : formatTime(user.lastSeen)}
                        </span>
                                            </div>
                                            <div className={styles.chatPreview}>
                                                {user.isOnline ? 'Active now' : 'Start a conversation'}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}

                            {/* Private conversations with messages */}
                            {peopleChats.map((conversation) => {
                                const isActive = conversation.id === activeConversationId;

                                return (
                                    <div
                                        key={conversation.id}
                                        onClick={() => onSelectConversation(
                                            conversation.id,
                                            'people',
                                            conversation.name
                                        )}
                                        className={`${styles.chatItem} ${isActive ? styles.active : ''}`}
                                    >
                                        <div className={styles.avatarContainer}>
                                            <img
                                                src={`https://i.pravatar.cc/150?u=${conversation.name}`}
                                                alt={conversation.name}
                                                className={styles.avatar}
                                            />
                                        </div>

                                        <div className={styles.chatContent}>
                                            <div className={styles.chatHeader}>
                                                <span className={styles.chatName}>{conversation.name}</span>
                                                <span className={styles.chatTime}>
                          {formatTime(conversation.lastMessage?.timestamp || conversation.updatedAt)}
                        </span>
                                            </div>
                                            <div className={styles.chatPreviewContainer}>
                        <span className={styles.chatPreview}>
                          {conversation.lastMessage
                              ? truncateMessage(conversation.lastMessage.content)
                              : 'No messages yet'}
                        </span>
                                                {conversation.unreadCount > 0 && (
                                                    <span className={styles.unreadBadge}>
                            {conversation.unreadCount}
                          </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Groups Section */}
                {roomChats.length > 0 && (
                    <div className={styles.section}>
                        <div className={styles.sectionHeader}>
                            <i className="fas fa-users"></i>
                            <span className={styles.sectionTitle}>Groups</span>
                            <span className={styles.sectionCount}>{roomChats.length}</span>
                        </div>

                        <div className={styles.chatList}>
                            {roomChats.map((conversation) => {
                                const isActive = conversation.id === activeConversationId;

                                return (
                                    <div
                                        key={conversation.id}
                                        onClick={() => onSelectConversation(
                                            conversation.id,
                                            'room',
                                            conversation.name
                                        )}
                                        className={`${styles.chatItem} ${isActive ? styles.active : ''}`}
                                    >
                                        <div className={styles.avatarContainer}>
                                            <div className={styles.groupAvatar}>
                                                <i className="fas fa-users"></i>
                                            </div>
                                        </div>

                                        <div className={styles.chatContent}>
                                            <div className={styles.chatHeader}>
                                                <span className={styles.chatName}>{conversation.name}</span>
                                                <span className={styles.chatTime}>
                          {formatTime(conversation.lastMessage?.timestamp || conversation.updatedAt)}
                        </span>
                                            </div>
                                            <div className={styles.chatPreviewContainer}>
                        <span className={styles.chatPreview}>
                          {conversation.lastMessage
                              ? `${conversation.lastMessage.sender.username}: ${truncateMessage(conversation.lastMessage.content, 25)}`
                              : 'No messages yet'}
                        </span>
                                                {conversation.unreadCount > 0 && (
                                                    <span className={styles.unreadBadge}>
                            {conversation.unreadCount}
                          </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Empty State */}
                {!loading &&
                    filteredConversations.length === 0 &&
                    filteredUsers.length === 0 && (
                        <div className={styles.emptyState}>
                            <i className="fas fa-comments"></i>
                            <p className={styles.emptyText}>
                                {searchQuery
                                    ? 'No conversations found'
                                    : 'No conversations yet'}
                            </p>
                            <p className={styles.emptySubtext}>
                                {searchQuery
                                    ? 'Try a different search term'
                                    : 'Start a new conversation to get started'}
                            </p>
                        </div>
                    )}
            </div>
        </div>
    );
};

export default ConversationSidebarView;