import React from 'react';
import ConversationItem from './ConversationItem';
import SearchBox from './SearchBox';
import styles from './ConversationList.module.css';
import { Room } from '../../../../types/chat';

/**
 * VIEW
 * Pure presentational component
 */
interface ConversationListViewProps {
    // Data
    rooms: Room[];
    users: any[];
    activeRoomId: string | null;

    // States
    loading: boolean;
    searchQuery: string;

    // Handlers
    onSelectConversation: (id: string, type: 'room' | 'people', name: string) => void;
    onSearchChange: (value: string) => void;
}

const ConversationListView: React.FC<ConversationListViewProps> = ({
                                                                       rooms,
                                                                       users,
                                                                       activeRoomId,
                                                                       loading,
                                                                       searchQuery,
                                                                       onSelectConversation,
                                                                       onSearchChange
                                                                   }) => {
    return (
        <div className={styles.listPanel}>
            <SearchBox value={searchQuery} onChange={onSearchChange} />

            {loading && <div style={{ padding: '20px', textAlign: 'center' }}>Loading...</div>}

            {/* Groups Section */}
            {rooms.length > 0 && (
                <div>
                    <div className={styles.sectionTitle}>Groups</div>
                    <div className={styles.chatListCard}>
                        {rooms.map((room) => (
                            <div
                                key={room.id}
                                onClick={() => onSelectConversation(room.id.toString(), 'room', room.name)}
                            >
                                <ConversationItem
                                    avatar="https://i.pravatar.cc/150?img=11"
                                    name={room.name}
                                    lastMessage={room.lastMessage?.content || 'No messages yet'}
                                    time="Today"
                                    unreadCount={room.unreadCount}
                                    isActive={room.id.toString() === activeRoomId}
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
                                    isActive={user.id === activeRoomId || user.username === activeRoomId}
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