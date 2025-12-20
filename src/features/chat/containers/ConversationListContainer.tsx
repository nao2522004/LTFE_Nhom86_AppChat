import React, { useEffect, useState, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../../../hooks/hooks';
import {
    setActiveRoom,
    getRoomMessages,
    getPeopleMessages,
    getUserList,
    selectRooms,
    selectActiveRoomId,
    selectUserList,
    selectChatLoading
} from '../chatSlice';
import ConversationListView from '../components/ConversationList/ConversationListView';

/**
 * CONTROLLER
 * Logic cho ConversationList
 */
const ConversationListContainer: React.FC = () => {
    const dispatch = useAppDispatch();
    const [searchQuery, setSearchQuery] = useState('');

    // ========== SELECTORS ==========
    const rooms = useAppSelector(selectRooms);
    const activeRoomId = useAppSelector(selectActiveRoomId);
    const userList = useAppSelector(selectUserList);
    const loading = useAppSelector(selectChatLoading);

    // ========== EFFECTS ==========
    // Load user list khi mount
    useEffect(() => {
        dispatch(getUserList());
    }, [dispatch]);

    // ========== EVENT HANDLERS ==========
    const handleSelectConversation = useCallback(async (
        id: string,
        type: 'room' | 'people',
        name: string
    ) => {
        // Set active room
        dispatch(setActiveRoom(id));

        // Load messages
        if (type === 'room') {
            await dispatch(getRoomMessages({ roomName: name, page: 1 }));
        } else {
            await dispatch(getPeopleMessages({ userName: name, page: 1 }));
        }
    }, [dispatch]);

    const handleSearchChange = useCallback((value: string) => {
        setSearchQuery(value);
    }, []);

    // ========== FILTER DATA ==========
    const filteredRooms = rooms.filter(room =>
        room.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const filteredUsers = userList.filter((user: any) =>
        user.username?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // ========== RENDER VIEW ==========
    return (
        <ConversationListView
            // Data
            rooms={filteredRooms}
            users={filteredUsers}
            activeRoomId={activeRoomId}

            // States
            loading={loading}
            searchQuery={searchQuery}

            // Handlers
            onSelectConversation={handleSelectConversation}
            onSearchChange={handleSearchChange}
        />
    );
};

export default ConversationListContainer;