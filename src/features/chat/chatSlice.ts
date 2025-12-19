import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {Message, Room} from "../../types/chat";

interface ChatState {
    messages: Message[];
    rooms: Room[];
    activeRoomId: string | null;
    subscribedChannels: string[];
    loading: boolean;
    error: string | null;
    sendingMessages: string[];
}

// ===== INITIAL STATE =====
const initialState: ChatState = {
    messages: [],
    rooms: [],
    activeRoomId: null,
    subscribedChannels: [],
    loading: false,
    error: null,
    sendingMessages: []
};

// ===== SLICE =====
const chatSlice = createSlice({
    name: 'chat',
    initialState,
    reducers: {
        // ===== MESSAGES =====
        addMessage: (state, action: PayloadAction<Message>) => {
            const exists = state.messages.find(m => m.id === action.payload.id);
            if (!exists) {
                state.messages.push(action.payload);
                state.messages.sort((a, b) =>
                    new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
                );
            }
        },

        updateMessage: (state, action: PayloadAction<{ id: string; updates: Partial<Message> }>) => {
            const index = state.messages.findIndex(m => m.id === action.payload.id);
            if (index !== -1) {
                state.messages[index] = {
                    ...state.messages[index],
                    ...action.payload.updates
                };
            }
        },

        removeMessage: (state, action: PayloadAction<string>) => {
            state.messages = state.messages.filter(m => m.id !== action.payload);
        },

        clearMessages: (state) => {
            state.messages = [];
        },

        setMessages: (state, action: PayloadAction<Message[]>) => {
            state.messages = action.payload.sort((a, b) =>
                new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
            );
        },

        // Track sending status
        markMessageSending: (state, action: PayloadAction<string>) => {
            if (!state.sendingMessages.includes(action.payload)) {
                state.sendingMessages.push(action.payload);
            }
        },

        markMessageSent: (state, action: PayloadAction<string>) => {
            state.sendingMessages = state.sendingMessages.filter(id => id !== action.payload);
        },

        markMessageFailed: (state, action: PayloadAction<string>) => {
            state.sendingMessages = state.sendingMessages.filter(id => id !== action.payload);
            const message = state.messages.find(m => m.id === action.payload);
            if (message) {
                message.status = 'failed';
            }
        },

        // ===== ROOMS =====
        addRoom: (state, action: PayloadAction<Room>) => {
            const exists = state.rooms.find(r => r.id === action.payload.id);
            if (!exists) {
                state.rooms.push(action.payload);
            }
        },

        updateRoom: (state, action: PayloadAction<{ id: string; updates: Partial<Room> }>) => {
            const index = state.rooms.findIndex(r => r.id === action.payload.id);
            if (index !== -1) {
                state.rooms[index] = {
                    ...state.rooms[index],
                    ...action.payload.updates
                };
            }
        },

        removeRoom: (state, action: PayloadAction<string>) => {
            state.rooms = state.rooms.filter(r => r.id !== action.payload);
        },

        setRooms: (state, action: PayloadAction<Room[]>) => {
            state.rooms = action.payload;
        },

        // ===== ACTIVE ROOM =====
        setActiveRoom: (state, action: PayloadAction<string | null>) => {
            state.activeRoomId = action.payload;

            // Clear unread count for active room
            if (action.payload) {
                const room = state.rooms.find(r => r.id === action.payload);
                if (room) {
                    room.unreadCount = 0;
                }
            }
        },

        incrementUnreadCount: (state, action: PayloadAction<string>) => {
            const room = state.rooms.find(r => r.id === action.payload);
            if (room && room.id !== state.activeRoomId) {
                room.unreadCount++;
            }
        },

        // ===== SUBSCRIPTIONS =====
        subscribeChannel: (state, action: PayloadAction<string>) => {
            if (!state.subscribedChannels.includes(action.payload)) {
                state.subscribedChannels.push(action.payload);
            }
        },

        unsubscribeChannel: (state, action: PayloadAction<string>) => {
            state.subscribedChannels = state.subscribedChannels.filter(
                ch => ch !== action.payload
            );
        },

        setSubscribedChannels: (state, action: PayloadAction<string[]>) => {
            state.subscribedChannels = action.payload;
        },

        // ===== LOADING & ERROR =====
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.loading = action.payload;
        },

        setError: (state, action: PayloadAction<string | null>) => {
            state.error = action.payload;
        },

        clearError: (state) => {
            state.error = null;
        },

        // ===== RESET =====
        resetChat: (state) => {
            state.messages = [];
            state.rooms = [];
            state.activeRoomId = null;
            state.subscribedChannels = [];
            state.loading = false;
            state.error = null;
            state.sendingMessages = [];
        }
    }
});

// ===== ACTIONS =====
export const {
    addMessage,
    updateMessage,
    removeMessage,
    clearMessages,
    setMessages,
    markMessageSending,
    markMessageSent,
    markMessageFailed,
    addRoom,
    updateRoom,
    removeRoom,
    setRooms,
    setActiveRoom,
    incrementUnreadCount,
    subscribeChannel,
    unsubscribeChannel,
    setSubscribedChannels,
    setLoading,
    setError,
    clearError,
    resetChat
} = chatSlice.actions;

// ===== SELECTORS =====
export const selectMessages = (state: { chat: ChatState }) => state.chat.messages;
export const selectRooms = (state: { chat: ChatState }) => state.chat.rooms;
export const selectActiveRoomId = (state: { chat: ChatState }) => state.chat.activeRoomId;
export const selectSubscribedChannels = (state: { chat: ChatState }) => state.chat.subscribedChannels;
export const selectChatLoading = (state: { chat: ChatState }) => state.chat.loading;
export const selectChatError = (state: { chat: ChatState }) => state.chat.error;

// New selector for checking if a message is sending
export const selectIsMessageSending = (messageId: string) => (state: { chat: ChatState }) => {
    return state.chat.sendingMessages.includes(messageId);
};

// Advanced selectors
export const selectActiveRoomMessages = (state: { chat: ChatState }) => {
    const { messages, activeRoomId } = state.chat;
    if (!activeRoomId) return [];
    return messages.filter(m => m.roomId === activeRoomId);
};

export const selectActiveRoom = (state: { chat: ChatState }) => {
    const { rooms, activeRoomId } = state.chat;
    if (!activeRoomId) return null;
    return rooms.find(r => r.id === activeRoomId) || null;
};

export const selectTotalUnreadCount = (state: { chat: ChatState }) => {
    return state.chat.rooms.reduce((total, room) => total + room.unreadCount, 0);
};

export const selectIsSubscribed = (channelId: string) => (state: { chat: ChatState }) => {
    return state.chat.subscribedChannels.includes(channelId);
};

export default chatSlice.reducer;