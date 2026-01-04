import React, {useState, useCallback, useEffect} from 'react';
import {useAppDispatch, useAppSelector} from '../../../hooks/hooks';
import {
    setActiveConversation,
    getGroupChatMessages,
    getPrivateChatMessages,
    selectConversations,
    selectActiveConversationId,
    selectUserList,
    selectChatLoading,
    createGroupChat,
    joinGroupChat,
    checkUserExist
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
    const [showModal, setShowModal] = useState(false);

    const conversations = useAppSelector(selectConversations);
    const activeConversationId = useAppSelector(selectActiveConversationId);
    const userList = useAppSelector(selectUserList);
    const loading = useAppSelector(selectChatLoading);

    // ========== EVENT HANDLERS ==========
    const handleSelectConversation = useCallback(async (
        id: string,
        type: 'room' | 'people',
        name: string
    ) => {
        // Set active room
        dispatch(setActiveConversation(id));

        // Load messages
        if (type === 'room') {
            await dispatch(getGroupChatMessages({name: name, page: 1}));
        } else {
            await dispatch(getPrivateChatMessages({name: name, page: 1}));
        }
    }, [dispatch]);

    const handleSearchChange = useCallback((value: string) => {
        setSearchQuery(value);
    }, []);

    const handleCreateGroupChat = async (groupName: string) => {
        try {
            await dispatch(createGroupChat(groupName)).unwrap();
            await dispatch(joinGroupChat(groupName)).unwrap();
            // Set active và load messages
            dispatch(setActiveConversation(groupName));
            await dispatch(getGroupChatMessages({name: groupName, page: 1}));
        } catch (error) {
            console.error('Failed to create room:', error);
            throw error;
        }
    };

    const handleJoinGroupChat = async (groupName: string) => {
        try {
            await dispatch(joinGroupChat(groupName)).unwrap();
            // Set active và load messages
            dispatch(setActiveConversation(groupName));
            await dispatch(getGroupChatMessages({name: groupName, page: 1}));
        } catch (error) {
            console.error('Failed to join room:', error);
            throw error;
        }
    };

    const handleStartChat = async (username: string) => {
        try {
            console.log('Starting chat with:', username);

            const result = await dispatch(checkUserExist(username));

            console.log('Full result:', result);

            if (checkUserExist.fulfilled.match(result)) {
                const payload = result.payload;

                console.log('Fulfilled payload:', payload);

                // FIX: Check payload.status instead of payload.exists
                let exists = false;

                if (typeof payload === 'object' && payload !== null) {
                    // Ưu tiên check `status` field (theo response từ server)
                    if ('status' in payload) {
                        exists = payload.status === true || payload.status === 'success';
                    }
                    // Fallback: check `exists` field
                    else if ('exists' in payload) {
                        exists = payload.exists === true;
                    }
                    // Fallback: check `user` field
                    else if ('user' in payload) {
                        exists = true;
                    }
                }

                console.log('Final exists value:', exists);

                if (!exists) {
                    throw new Error('User không tồn tại');
                }

                // Nếu user tồn tại, tiếp tục load messages
                dispatch(setActiveConversation(username));
                await dispatch(getPrivateChatMessages({name: username, page: 1}));

            } else if (checkUserExist.rejected.match(result)) {
                console.error('Rejected:', result);
                throw new Error(result.payload as string || 'Không thể kiểm tra user');
            }
        } catch (error: any) {
            console.error('Error:', error);
            throw error;
        }
    };

    // ========== FILTER DATA ==========
    const filteredConversations = conversations.filter(conversation =>
        conversation.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const filteredUsers = userList.filter((user: any) =>
        user.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.displayName?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // ========== RENDER VIEW ==========
    return (
        <>
            <ConversationListView
                // Data
                conversations={filteredConversations}
                users={filteredUsers}
                activeConversationId={activeConversationId}

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
                    onCreateGroupChat={handleCreateGroupChat}
                    onJoinGroupChat={handleJoinGroupChat}
                    onStartChat={handleStartChat}
                    userList={userList}
                />
            )}
        </>
    );
};

export default ConversationListContainer;