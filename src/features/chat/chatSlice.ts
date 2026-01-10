import {createAsyncThunk, createSelector, createSlice, PayloadAction} from '@reduxjs/toolkit';
import {
    Message,
    Conversation
} from "../../shared/types/chat";
import {RootState} from "../../app/store";

const selectChatState = (state: RootState) => state.chat;

interface ChatState {
    messages: {
        byId: Record<string, Message>;
        allIds: string[];
    };
    conversations: {
        byId: Record<string, Conversation>;
        allIds: string[];
    };
    users: {
        byId: Record<string, any>;
        allIds: string[];
    };
}

const initialState: ChatState = {
    messages: {byId: {}, allIds: []},
    conversations: {byId: {}, allIds: []},
    users: {byId: {}, allIds: []},
};

const chatSlice = createSlice({
    name: 'chat',
    initialState,
    reducers: {
        // ===== MESSAGES =====
        addMessage: (state, action: PayloadAction<Message>) => {
            const msg = action.payload;
            if (!state.messages.byId[msg.id]) {
                state.messages.byId[msg.id] = msg;
                state.messages.allIds.push(msg.id);
            }
        },

        updateMessage: (state, action: PayloadAction<{ id: string; updates: Partial<Message> }>) => {
            const {id, updates} = action.payload;
            if (state.messages.byId[id]) {
                state.messages.byId[id] = {...state.messages.byId[id], ...updates};
            }
        },

        removeMessage: (state, action: PayloadAction<string>) => {
            const id = action.payload;
            delete state.messages.byId[id];
            state.messages.allIds = state.messages.allIds.filter(msgId => msgId !== id);
        },

        clearMessages: (state) => {
            state.messages = {byId: {}, allIds: []};
        },

        setMessages: (state, action: PayloadAction<Message[]>) => {
            state.messages.byId = {};
            state.messages.allIds = [];
            action.payload.forEach(msg => {
                state.messages.byId[msg.id] = msg;
                state.messages.allIds.push(msg.id);
            });
        },

        // ===== CONVERSATIONS =====
        addConversation: (state, action: PayloadAction<Conversation>) => {
            const conv = action.payload;
            if (!state.conversations.byId[conv.id]) {
                state.conversations.byId[conv.id] = conv;
                state.conversations.allIds.push(conv.id);
            }
        },

        updateConversation: (state, action: PayloadAction<{ id: string; updates: Partial<Conversation> }>) => {
            const {id, updates} = action.payload;
            if (state.conversations.byId[id]) {
                state.conversations.byId[id] = {...state.conversations.byId[id], ...updates};
            }
        },

        removeConversation: (state, action: PayloadAction<string>) => {
            const id = action.payload;
            delete state.conversations.byId[id];
            state.conversations.allIds = state.conversations.allIds.filter(cId => cId !== id);
        },

        setConversations: (state, action: PayloadAction<Conversation[]>) => {
            state.conversations.byId = {};
            state.conversations.allIds = [];
            action.payload.forEach(conv => {
                state.conversations.byId[conv.id] = conv;
                state.conversations.allIds.push(conv.id);
            });
        },

        incrementUnreadCount: (state, action: PayloadAction<string>) => {
            const conv = state.conversations.byId[action.payload];
            if (conv) {
                conv.unreadCount = (conv.unreadCount || 0) + 1;
            }
        },

        // ===== USERS =====
        addUser: (state, action: PayloadAction<any>) => {
            const user = action.payload;
            const id = user.username || user.id;
            if (!state.users.byId[id]) {
                state.users.byId[id] = user;
                state.users.allIds.push(id);
            }
        },

        updateUser: (state, action: PayloadAction<{ id: string; updates: any }>) => {
            const {id, updates} = action.payload;
            if (state.users.byId[id]) {
                state.users.byId[id] = {...state.users.byId[id], ...updates};
            }
        },

        setUsers: (state, action: PayloadAction<any[]>) => {
            state.users.byId = {};
            state.users.allIds = [];
            action.payload.forEach(user => {
                const id = user.username || user.id;
                state.users.byId[id] = user;
                state.users.allIds.push(id);
            });
        },

        // ===== RESET =====
        resetChat: () => initialState,
    },
});

// ===== BASIC SELECTORS =====
export const selectAllMessages = (state: { chat: ChatState }) =>
    state.chat.messages.allIds.map(id => state.chat.messages.byId[id]);

export const selectMessageById = (id: string) => (state: { chat: ChatState }) =>
    state.chat.messages.byId[id];

export const selectAllConversations = createSelector(
    [selectChatState],
    (chat) => chat.conversations.allIds.map(id => chat.conversations.byId[id])
);

export const selectConversationById = (id: string) => (state: { chat: ChatState }) =>
    state.chat.conversations.byId[id];

export const selectAllUsers = createSelector(
    [selectChatState],
    (chat) => chat.users.allIds.map(id => chat.users.byId[id])
);

export const selectUserById = (id: string) => (state: { chat: ChatState }) =>
    state.chat.users.byId[id];

export const {
    addMessage,
    updateMessage,
    removeMessage,
    setMessages,
    clearMessages,
    addConversation,
    updateConversation,
    removeConversation,
    setConversations,
    incrementUnreadCount,
    addUser,
    updateUser,
    setUsers,
    resetChat
} = chatSlice.actions;

export default chatSlice.reducer;