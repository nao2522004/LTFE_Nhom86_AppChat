import React, { useEffect, useState } from "react";
import {
    setActiveRoom,
    getRoomMessages,
    getPeopleMessages,
    getUserList,
    selectRooms,
    selectActiveRoomId,
    selectUserList,
    selectChatLoading
} from "../../chatSlice";
import ConversationItem from "./ConversationItem";
import SearchBox from "./SearchBox";
import styles from "./ConversationList.module.css";
import {useAppDispatch, useAppSelector} from "../../../../hooks/hooks";

const ConversationList: React.FC = () => {
    const dispatch = useAppDispatch();

    // ② ĐỌC state từ chatSlice
    const rooms = useAppSelector(selectRooms);
    const activeRoomId = useAppSelector(selectActiveRoomId);
    const userList = useAppSelector(selectUserList);
    const loading = useAppSelector(selectChatLoading);

    const [searchQuery, setSearchQuery] = useState('');

    // Load user list khi component mount
    useEffect(() => {
        dispatch(getUserList());
    }, [dispatch]);

    // ① GỬI action khi user click vào conversation
    const handleSelectConversation = async (id: string, type: 'room' | 'people', name: string) => {
        // Set active room
        dispatch(setActiveRoom(id));

        // Load messages
        if (type === 'room') {
            await dispatch(getRoomMessages({ roomName: name, page: 1 }));
        } else {
            await dispatch(getPeopleMessages({ userName: name, page: 1 }));
        }
    };

    // Filter rooms by search query
    const filteredRooms = rooms.filter(room =>
        room.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Filter users by search query
    const filteredUsers = userList.filter((user: any) =>
        user.username?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className={styles.listPanel}>
            <SearchBox value={searchQuery} onChange={setSearchQuery} />

            {loading && <div style={{ padding: '20px', textAlign: 'center' }}>Loading...</div>}

            {/* Group Section */}
            {filteredRooms.length > 0 && (
                <div>
                    <div className={styles.sectionTitle}>Groups</div>
                    <div className={styles.chatListCard}>
                        {filteredRooms.map((room) => (
                            <div
                                key={room.id}
                                onClick={() => handleSelectConversation(room.id, 'room', room.name)}
                            >
                                <ConversationItem
                                    avatar="https://i.pravatar.cc/150?img=11"
                                    name={room.name}
                                    lastMessage={room.lastMessage?.content || 'No messages yet'}
                                    time="Today"
                                    unreadCount={room.unreadCount}
                                    isActive={room.id === activeRoomId}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* People Section */}
            {filteredUsers.length > 0 && (
                <div>
                    <div className={styles.sectionTitle}>People</div>
                    <div className={styles.chatListCard}>
                        {filteredUsers.map((user: any) => (
                            <div
                                key={user.id || user.username}
                                onClick={() => handleSelectConversation(
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

export default ConversationList;