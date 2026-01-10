import { createAsyncThunk } from '@reduxjs/toolkit';
import websocketService from '../../services/websocket/MainService';
import {
    addMessage,
    addConversation,
    setMessages,
    setConversations,
    setUsers,
    addUser,
    updateMessage,
    removeMessage
} from './chatSlice';
import {
    setMessagesLoading,
    setMessagesError,
    setMessagesPage,
    setMessagesHasMore,
    addSendingMessage,
    removeSendingMessage
} from '../ui/uiSlice';
import { RootState } from '../../app/store';
import { Message, RawServerMessage, transformServerMessage, TransformContext } from '../../shared/types/chat';

// ===== SEND MESSAGE =====
export const sendChatMessage = createAsyncThunk(
    'chat/sendMessage',
    async (
        { type, to, mes }: { type: 'room' | 'people'; to: string; mes: string },
        { rejectWithValue, getState, dispatch }
    ) => {
        try {
            const state = getState() as RootState;
            const currentUser = state.auth.user;

            if (!currentUser) {
                throw new Error('User not authenticated');
            }

            // Tạo temporary message
            const tempMessage: Message = {
                id: `temp_${Date.now()}_${Math.random()}`,
                content: mes,
                contentData: { type: 'text', text: mes },
                sender: {
                    id: currentUser.username,
                    username: currentUser.username,
                    displayName: currentUser.displayName || currentUser.username,
                    avatar: currentUser.avatar || `https://i.pravatar.cc/150?u=${currentUser.username}`
                },
                receiver: {
                    id: to,
                    name: to,
                    type: type === 'room' ? 'room' : 'people',
                    avatar: `https://i.pravatar.cc/150?u=${to}`
                },
                timestamp: new Date().toISOString(),
                status: 'sending',
                type: 'text',
                reactions: []
            };

            // Add temp message to UI
            dispatch(addMessage(tempMessage));
            dispatch(addSendingMessage(tempMessage.id));

            // Send to server
            await websocketService.sendChat({ type, to, mes });

            // Update status to sent
            dispatch(updateMessage({ id: tempMessage.id, updates: { status: 'sent' } }));
            dispatch(removeSendingMessage(tempMessage.id));

            return { tempId: tempMessage.id, timestamp: tempMessage.timestamp };
        } catch (error: any) {
            return rejectWithValue(error.message || 'Failed to send message');
        }
    }
);

// ===== GET ROOM MESSAGES =====
export const getRoomMessages = createAsyncThunk(
    'chat/getRoomMessages',
    async (
        { name, page }: { name: string; page: number },
        { rejectWithValue, getState, dispatch }
    ) => {
        try {
            dispatch(setMessagesLoading(true));

            const response = await websocketService.getRoomChatMessages({ name, page });
            const state = getState() as RootState;

            const context: TransformContext = {
                conversations: state.chat.conversations.allIds.map(id => ({
                    id,
                    name: state.chat.conversations.byId[id].name
                })),
                users: state.chat.users.allIds.map(id => ({
                    id,
                    username: state.chat.users.byId[id].username
                }))
            };

            const messages = (response.messages || []).map((raw: RawServerMessage) =>
                transformServerMessage(raw, context)
            );

            if (page === 1) {
                dispatch(setMessages(messages));
            } else {
                messages.forEach(msg => dispatch(addMessage(msg)));
            }

            dispatch(setMessagesPage(page));
            dispatch(setMessagesHasMore(messages.length > 0));
            dispatch(setMessagesLoading(false));

            return { messages, page };
        } catch (error: any) {
            dispatch(setMessagesLoading(false));
            dispatch(setMessagesError(error.message));
            return rejectWithValue(error.message || 'Failed to get messages');
        }
    }
);

// ===== GET PEOPLE MESSAGES =====
export const getPeopleMessages = createAsyncThunk(
    'chat/getPeopleMessages',
    async (
        { name, page }: { name: string; page: number },
        { rejectWithValue, getState, dispatch }
    ) => {
        try {
            dispatch(setMessagesLoading(true));

            const response = await websocketService.getPeopleChatMessages({ name, page });
            const state = getState() as RootState;

            const context: TransformContext = {
                conversations: state.chat.conversations.allIds.map(id => ({
                    id,
                    name: state.chat.conversations.byId[id].name
                })),
                users: state.chat.users.allIds.map(id => ({
                    id,
                    username: state.chat.users.byId[id].username
                }))
            };

            const messages = (response.messages || []).map((raw: RawServerMessage) =>
                transformServerMessage(raw, context)
            );

            if (page === 1) {
                dispatch(setMessages(messages));
            } else {
                messages.forEach((msg: Message) => dispatch(addMessage(msg)));
            }

            dispatch(setMessagesPage(page));
            dispatch(setMessagesHasMore(messages.length > 0));
            dispatch(setMessagesLoading(false));

            return { messages, page };
        } catch (error: any) {
            dispatch(setMessagesLoading(false));
            dispatch(setMessagesError(error.message));
            return rejectWithValue(error.message || 'Failed to get messages');
        }
    }
);

// ===== CREATE ROOM =====
export const createRoom = createAsyncThunk(
    'chat/createRoom',
    async (roomName: string, { rejectWithValue, dispatch }) => {
        try {
            const response = await websocketService.createRoom({ name: roomName });

            if (response.room) {
                dispatch(addConversation(response.room));
            }

            return response;
        } catch (error: any) {
            return rejectWithValue(error.message || 'Failed to create room');
        }
    }
);

// ===== JOIN ROOM =====
export const joinRoom = createAsyncThunk(
    'chat/joinRoom',
    async (roomName: string, { rejectWithValue }) => {
        try {
            const response = await websocketService.joinRoom({ name: roomName });
            return response;
        } catch (error: any) {
            return rejectWithValue(error.message || 'Failed to join room');
        }
    }
);

// ===== GET USER LIST =====
export const getUserList = createAsyncThunk(
    'chat/getUserList',
    async (_, { rejectWithValue, dispatch }) => {
        try {
            const response = await websocketService.getUserList();

            if (response.users) {
                dispatch(setUsers(response.users));
            }

            if (response.conversations) {
                dispatch(setConversations(response.conversations));
            }

            return response;
        } catch (error: any) {
            return rejectWithValue(error.message || 'Failed to get user list');
        }
    }
);

// ===== CHECK USER EXISTS =====
export const checkUserExist = createAsyncThunk(
    'chat/checkUserExist',
    async (username: string, { rejectWithValue }) => {
        try {
            const response = await websocketService.checkUserExist(username);
            return response;
        } catch (error: any) {
            return rejectWithValue(error.message || 'Failed to check user');
        }
    }
);

// ===== START CHAT WITH USER =====
export const startChatWithUser = createAsyncThunk(
    'chat/startChatWithUser',
    async (username: string, { dispatch, rejectWithValue }) => {
        try {
            // Check if user exists
            const existResult = await dispatch(checkUserExist(username)).unwrap();

            if (!existResult.exists) {
                throw new Error('User does not exist');
            }

            // Add user to store
            const user = {
                id: username,
                username: username,
                displayName: existResult.user?.displayName || username,
                avatar: existResult.user?.avatar || null,
                email: '',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                isOnline: true,
            };

            dispatch(addUser(user));

            // Load messages
            await dispatch(getPeopleMessages({ name: username, page: 1 }));

            return { user };
        } catch (error: any) {
            return rejectWithValue(error.message || 'Failed to start chat');
        }
    }
);