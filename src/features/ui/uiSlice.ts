// src/features/ui/uiSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

/**
 * UI STATE - View layer only
 * Separates UI state from data state
 */

interface UIState {
    activeConversationId: string | null;

    loading: {
        messages: boolean;
        conversations: boolean;
        users: boolean;
    };

    errors: {
        messages: string | null;
        conversations: string | null;
        users: string | null;
    };

    pagination: {
        messages: {
            currentPage: number;
            hasMore: boolean;
        };
    };

    sendingMessageIds: string[];
}

const initialState: UIState = {
    activeConversationId: null,
    loading: {
        messages: false,
        conversations: false,
        users: false,
    },
    errors: {
        messages: null,
        conversations: null,
        users: null,
    },
    pagination: {
        messages: {
            currentPage: 1,
            hasMore: true,
        },
    },
    sendingMessageIds: [],
};

const uiSlice = createSlice({
    name: 'ui',
    initialState,
    reducers: {
        setActiveConversation: (state, action: PayloadAction<string | null>) => {
            state.activeConversationId = action.payload;
        },

        setMessagesLoading: (state, action: PayloadAction<boolean>) => {
            state.loading.messages = action.payload;
        },

        setConversationsLoading: (state, action: PayloadAction<boolean>) => {
            state.loading.conversations = action.payload;
        },

        setUsersLoading: (state, action: PayloadAction<boolean>) => {
            state.loading.users = action.payload;
        },

        setMessagesError: (state, action: PayloadAction<string | null>) => {
            state.errors.messages = action.payload;
        },

        setConversationsError: (state, action: PayloadAction<string | null>) => {
            state.errors.conversations = action.payload;
        },

        setUsersError: (state, action: PayloadAction<string | null>) => {
            state.errors.users = action.payload;
        },

        clearErrors: (state) => {
            state.errors = initialState.errors;
        },

        setMessagesPage: (state, action: PayloadAction<number>) => {
            state.pagination.messages.currentPage = action.payload;
        },

        setMessagesHasMore: (state, action: PayloadAction<boolean>) => {
            state.pagination.messages.hasMore = action.payload;
        },

        addSendingMessage: (state, action: PayloadAction<string>) => {
            if (!state.sendingMessageIds.includes(action.payload)) {
                state.sendingMessageIds.push(action.payload);
            }
        },

        removeSendingMessage: (state, action: PayloadAction<string>) => {
            state.sendingMessageIds = state.sendingMessageIds.filter(
                id => id !== action.payload
            );
        },

        resetUI: () => initialState,
    },
});

// ===== SELECTORS =====
export const selectActiveConversationId = (state: { ui: UIState }) =>
    state.ui.activeConversationId;

export const selectMessagesLoading = (state: { ui: UIState }) =>
    state.ui.loading.messages;

export const selectMessagesError = (state: { ui: UIState }) =>
    state.ui.errors.messages;

export const selectMessagesPagination = (state: { ui: UIState }) =>
    state.ui.pagination.messages;

export const selectIsSendingMessage = (id: string) => (state: { ui: UIState }) =>
    state.ui.sendingMessageIds.includes(id);

export const {
    setActiveConversation,
    setMessagesLoading,
    setConversationsLoading,
    setUsersLoading,
    setMessagesError,
    setConversationsError,
    setUsersError,
    clearErrors,
    setMessagesPage,
    setMessagesHasMore,
    addSendingMessage,
    removeSendingMessage,
    resetUI,
} = uiSlice.actions;

export default uiSlice.reducer;