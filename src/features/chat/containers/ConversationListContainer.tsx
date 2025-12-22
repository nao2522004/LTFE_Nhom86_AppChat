import React, { useState, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../../../hooks/hooks';
import {
    setActiveRoom,
    getRoomMessages,
    getPeopleMessages,
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
    const rooms = useAppSelector(selectRooms);
    const activeRoomId = useAppSelector(selectActiveRoomId);
    const userList = useAppSelector(selectUserList);
    const loading = useAppSelector(selectChatLoading);

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
        rooms.filter(room =>
            room.name.toLowerCase().includes(searchQuery.toLowerCase())
        ), [rooms, searchQuery]
    );

    const filteredUsers = userList.filter((user: any) =>
        userList.filter((user: any) =>
            user.username?.toLowerCase().includes(searchQuery.toLowerCase())
        ), [userList, searchQuery]
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