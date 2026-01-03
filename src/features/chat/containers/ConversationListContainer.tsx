import React, {useState, useCallback, useEffect} from 'react';
import {useAppDispatch, useAppSelector} from '../../../hooks/hooks';
import {
    setActiveRoom,
    getRoomMessages,
    getPeopleMessages,
    selectRooms,
    selectActiveRoomId,
    selectUserList,
    selectChatLoading, createRoom, joinRoom, checkUser
} from '../chatSlice';
import ConversationListView from '../components/ConversationList/ConversationListView';
import CreateConversationModal from '../components/ConversationList/CreateConversationModal';

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
    const [showModal, setShowModal] = useState(false);

    // useEffect(() => {
    //     console.log('ConversationList Data:', {
    //         rooms: rooms.length,
    //         users: userList.length,
    //         roomsData: rooms,
    //         usersData: userList
    //     });
    // }, [rooms, userList]);

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
            await dispatch(getRoomMessages({roomName: name, page: 1}));
        } else {
            await dispatch(getPeopleMessages({userName: name, page: 1}));
        }
    }, [dispatch]);

    const handleSearchChange = useCallback((value: string) => {
        setSearchQuery(value);
    }, []);

    const handleCreateRoom = async (roomName: string) => {
        await dispatch(createRoom(roomName));
        await dispatch(joinRoom(roomName)); // Auto join after create
        // Load messages
        await dispatch(getRoomMessages({roomName, page: 1}));
    };

    const handleJoinRoom = async (roomName: string) => {
        await dispatch(joinRoom(roomName));
        await dispatch(getRoomMessages({roomName, page: 1}));
    };

    const handleStartChat = async (username: string) => {
        // Check if user exists first
        await dispatch(checkUser(username));
        // Set as active and load messages
        dispatch(setActiveRoom(username));
        await dispatch(getPeopleMessages({userName: username, page: 1}));
    };

    // ========== FILTER DATA ==========
    const filteredRooms = rooms.filter(room =>
        room.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const filteredUsers = userList.filter((user: any) =>
        user.username?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // ========== RENDER VIEW ==========
    return (
        <>
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
                onOpenModal={() => setShowModal(true)}
            />

            {/* Modal phải nằm trong cùng một khối return nhưng dưới ListView */}
            {showModal && (
                <CreateConversationModal
                    onClose={() => setShowModal(false)}
                    onCreateRoom={handleCreateRoom}
                    onJoinRoom={handleJoinRoom}
                    onStartChat={handleStartChat}
                    userList={userList}
                />
            )}
        </>
    );
};

export default ConversationListContainer;