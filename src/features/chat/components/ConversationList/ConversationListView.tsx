import React from 'react';
import ConversationItem from './ConversationItem';
import SearchBox from './SearchBox';
import styles from './ConversationList.module.css';
import {Conversation} from '../../../../shared/types/chat';

/**
 * VIEW
 * Pure presentational component
 */
interface ConversationListViewProps {
    // Data
    conversations: Conversation[];
    users: any[];
    activeConversationId: string | null;

    // States
    loading: boolean;
    searchQuery: string;

    // Handlers
    onSelectConversation: (id: string, type: 'room' | 'people', name: string) => void;
    onSearchChange: (value: string) => void;
    onOpenModal: () => void;
}

const ConversationListView: React.FC<ConversationListViewProps> = ({
                                                                       conversations,
                                                                       users,
                                                                       activeConversationId,
                                                                       loading,
                                                                       searchQuery,
                                                                       onSelectConversation,
                                                                       onSearchChange,
                                                                       onOpenModal
                                                                   }) => {
    return (
        <div className={styles.listPanel}>
            <SearchBox value={searchQuery} onChange={onSearchChange} />

            <button
                onClick={onOpenModal}
                style={{
                    width: '100%',
                    padding: '14px 20px',
                    backgroundColor: '#5d8e85',
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    marginBottom: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 2px 8px rgba(93, 142, 133, 0.3)'
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#4e7a73';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#5d8e85';
                    e.currentTarget.style.transform = 'translateY(0)';
                }}
            >
                <i className="fas fa-plus"></i>
                New Conversation
            </button>

            {loading && <div style={{ padding: '20px', textAlign: 'center' }}>Loading...</div>}

            {/* Groups Section */}
            {conversations.length > 0 && (
                <div>
                    <div className={styles.sectionTitle}>Groups</div>
                    <div className={styles.chatListCard}>
                        {conversations
                            .filter(c => c.type === 'group')
                            .map((conversation) => (
                                <div
                                    key={conversation.id}
                                    onClick={() => onSelectConversation(
                                        conversation.id.toString(),
                                        'room',
                                        conversation.name
                                    )}
                                >
                                    <ConversationItem
                                        avatar="https://i.pravatar.cc/150?img=11"
                                        name={conversation.name}
                                        lastMessage={conversation.lastMessage?.content || 'No messages yet'}
                                        time="Today"
                                        unreadCount={conversation.unreadCount}
                                        isActive={conversation.id.toString() === activeConversationId}
                                    />
                                </div>
                            ))}
                    </div>
                </div>
            )}

            {/* People Section */}
            {users.length > 0 && (
                <div>
                    <div className={styles.sectionTitle}>People</div>
                    <div className={styles.chatListCard}>
                        {users.map((user: any) => (
                            <div
                                key={user.id || user.username}
                                onClick={() => onSelectConversation(
                                    user.id || user.username,
                                    'people',
                                    user.username
                                )}
                            >
                                <ConversationItem
                                    avatar={user.avatar || `https://i.pravatar.cc/150?img=${user.id || 3}`}
                                    name={user.displayName || user.username}
                                    lastMessage={user.lastMessage || 'Start a conversation'}
                                    time="Today"
                                    isActive={user.id === activeConversationId || user.username === activeConversationId}
                                    isOnline={user.isOnline}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ConversationListView;