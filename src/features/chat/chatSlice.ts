import {createAsyncThunk, createSlice, PayloadAction} from '@reduxjs/toolkit';
import {Message, Conversation, RawServerMessage, transformServerMessage, TransformContext} from "../../shared/types/chat";
import websocketService from "../../services/websocket/MainService";

interface ChatState {
    messages: Message[];
    conversations: Conversation[];
    activeConversationId: string | null;
    subscribedConversationIds: string[];
    loading: boolean;
    error: string | null;
    sendingMessages: string[];
    currentPage: number;
    hasMoreMessages: boolean;
    userList: any[];
}

// ===== INITIAL STATE =====
const initialState: ChatState = {
    messages: [],
    conversations: [],
    activeConversationId: null,
    subscribedConversationIds: [],
    loading: false,
    error: null,
    sendingMessages: [],
    currentPage: 1,
    hasMoreMessages: true,
    userList: []
};

// ===== ASYNC THUNKS FOR API =====
/**
 * EVENT: CREATE_ROOM API
 * Request: DATA: { "name": "ABC" }
 */
export const createGroupChat = createAsyncThunk(
    'chat/createGroupChat',
    async (groupName: string, {rejectWithValue}) => {
        try {
            const response = await websocketService.createGroupChat(groupName);
            return response;
        } catch (error: any) {
            return rejectWithValue(error.message || 'Failed to create group chat');
        }
    }
);

/**
 * EVENT: JOIN_ROOM API
 * Request: DATA: { "name": "ABC" }
 */
export const joinGroupChat = createAsyncThunk(
    'chat/joinGroupChat',
    async (groupName: string, {rejectWithValue}) => {
        try {
            const response = await websocketService.joinGroupChat(groupName);
            return response;
        } catch (error: any) {
            return rejectWithValue(error.message || 'Failed to join room');
        }
    }
);

/**
 * GET_ROOM_CHAT_MES API
 * Request: { "name": "ABC", "page": 1 }
 */
export const getGroupChatMessages = createAsyncThunk(
    'chat/getGroupChatMessages',
    async ({name, page}: { name: string; page: number }, {rejectWithValue, getState}) => {
        try {
            const response = await websocketService.getGroupChatMessages({name, page});
            const state = getState() as any;
            const context: TransformContext = {
                conversations: state.chat.conversations.map((c: Conversation) => ({
                    id: c.id,
                    name: c.name
                })),
                users: state.chat.userList.map((u: any) => ({
                    id: u.id || u.username,
                    username: u.username
                }))
            };
            return {name, messages: response.messages || [], page, context};
        } catch (error: any) {
            return rejectWithValue(error.message || 'Failed to get group chat messages');
        }
    }
);

/**
 * GET_PEOPLE_CHAT_MES API
 * Request: { "name": "ti", "page": 1 }
 */
export const getPrivateChatMessages = createAsyncThunk(
    'chat/getPrivateChatMessages',
    async ({name, page}: { name: string; page: number }, {rejectWithValue, getState}) => {
        try {
            const response = await websocketService.getPrivateChatMessages({name, page});
            const state = getState() as any;
            const context: TransformContext = {
                conversations: state.chat.conversations.map((c: Conversation) => ({
                    id: c.id,
                    name: c.name
                })),
                users: state.chat.userList.map((u: any) => ({
                    id: u.id || u.username,
                    username: u.username
                }))
            };
            return {name, messages: response.messages || [], page, context};
        } catch (error: any) {
            return rejectWithValue(error.message || 'Failed to get people messages');
        }
    }
);

/**
 * SEND_CHAT API
 * Request: { "type": "room"|"people", "to": "abc", "mes": "hello" }
 */
export const sendChatMessage = createAsyncThunk(
    'chat/sendMessage',
    async (
        {type, to, mes}: { type: 'room' | 'people'; to: string; mes: string },
        {rejectWithValue}
    ) => {
        try {
            await websocketService.sendChat({type, to, mes});
            return {type, to, mes, timestamp: new Date().toISOString()};
        } catch (error: any) {
            return rejectWithValue(error.message || 'Failed to send message');
        }
    }
);

/**
 * CHECK_USER_EXIST API - Kiểm tra user có tồn tại không
 */
export const checkUserExist = createAsyncThunk(
    'chat/checkUserExist',
    async (username: string, {rejectWithValue}) => {
        try {
            const response = await websocketService.checkUserExist(username);
            return response;
        } catch (error: any) {
            return rejectWithValue(error.message || 'Failed to check user');
        }
    }
);

/**
 * CHECK_USER_ONLINE API - Kiểm tra user có online không
 */
export const checkUserOnline = createAsyncThunk(
    'chat/checkUserOnline',
    async (username: string, {rejectWithValue}) => {
        try {
            const response = await websocketService.checkUserOnline(username);
            return response;
        } catch (error: any) {
            return rejectWithValue(error.message || 'Failed to check user online status');
        }
    }
);

/**
 * START_CHAT_WITH_USER - Bắt đầu chat với user mới
 * Flow: Check user exist → Add to userList → Load messages
 */
export const startChatWithUser = createAsyncThunk(
    'chat/startChatWithUser',
    async (username: string, {dispatch, rejectWithValue}) => {
        try {
            // 1. Check user exist
            const existResult = await dispatch(checkUserExist(username)).unwrap();

            if (!existResult.exists) {
                throw new Error('User does not exist');
            }

            // 2. Check online status (optional)
            const onlineResult = await dispatch(checkUserOnline(username)).unwrap();

            // 3. Create user object
            const user = {
                id: username,
                username: username,
                displayName: existResult.user?.displayName || username,
                avatar: existResult.user?.avatar || null,
                isOnline: onlineResult.isOnline || false,
                lastSeen: onlineResult.lastSeen,
                type: 'user'
            };

            // 4. Load messages (page 1)
            const messagesResult = await dispatch(getPrivateChatMessages({
                name: username,
                page: 1
            })).unwrap();

            return {
                user,
                messages: messagesResult.messages || []
            };
        } catch (error: any) {
            return rejectWithValue(error.message || 'Failed to start chat');
        }
    }
);

/**
 * GET_USER_LIST API
 */
export const getUserList = createAsyncThunk(
    'chat/getUserList',
    async (_, {rejectWithValue}) => {
        try {
            const response = await websocketService.getUserList();
            return {
                users: response.users || [],
                conversations: response.conversations || []
            };
        } catch (error: any) {
            return rejectWithValue(error.message || 'Failed to get user list');
        }
    }
);

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
                    a.timestamp.localeCompare(b.timestamp)
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
                a.timestamp.localeCompare(b.timestamp)
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

        // ===== CONVERSATIONS =====
        addConversation: (state, action: PayloadAction<Conversation>) => {
            const exists = state.conversations.find(c => c.id === action.payload.id);
            if (!exists) {
                state.conversations.push(action.payload);
            }
        },

        updateConversation: (state, action: PayloadAction<{ id: string; updates: Partial<Conversation> }>) => {
            const index = state.conversations.findIndex(c => c.id === action.payload.id);
            if (index !== -1) {
                state.conversations[index] = {
                    ...state.conversations[index],
                    ...action.payload.updates
                };
            }
        },

        removeConversation: (state, action: PayloadAction<string>) => {
            state.conversations = state.conversations.filter(c => c.id !== action.payload);
        },

        setConversations: (state, action: PayloadAction<Conversation[]>) => {
            state.conversations = action.payload;
        },

        // ===== ACTIVE CONVERSATION =====
        setActiveConversation: (state, action: PayloadAction<string | null>) => {
            state.activeConversationId  = action.payload;

            // Clear unread count for active conversation
            if (action.payload) {
                const conversation  = state.conversations.find(c => c.id === action.payload);
                if (conversation ) {
                    conversation .unreadCount = 0;
                }
            }
        },

        incrementUnreadCount: (state, action: PayloadAction<string>) => {
            const conversation = state.conversations.find(c => c.id === action.payload);
            if (conversation && conversation.id !== state.activeConversationId) {
                conversation.unreadCount++;
            }
        },

        // ===== ACTIVE CONVERSATION IDS =====
        addSubscribedConversation: (state, action: PayloadAction<string>) => {
            if (!state.subscribedConversationIds.includes(action.payload)) {
                state.subscribedConversationIds.push(action.payload);
            }
        },

        removeSubscribedConversation: (state, action: PayloadAction<string>) => {
            state.subscribedConversationIds = state.subscribedConversationIds.filter(
                id => id !== action.payload
            );
        },

        setSubscribedConversationIds: (state, action: PayloadAction<string[]>) => {
            state.subscribedConversationIds = action.payload;
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

        // ===== PAGINATION =====
        setCurrentPage: (state, action: PayloadAction<number>) => {
            state.currentPage = action.payload;
        },

        setHasMoreMessages: (state, action: PayloadAction<boolean>) => {
            state.hasMoreMessages = action.payload;
        },

        // ===== RESET =====
        resetChat: (state) => {
            state.messages = [];
            state.conversations = [];
            state.activeConversationId = null;
            state.subscribedConversationIds = [];
            state.loading = false;
            state.error = null;
            state.sendingMessages = [];
            state.currentPage = 1;
            state.hasMoreMessages = true;
            state.userList = [];
        }
    },

    // =============== ExtraReducer For API =================
    extraReducers: (builder) => {
        // ===== CREATE ROOM =====
        builder
            .addCase(createGroupChat.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createGroupChat.fulfilled, (state, action) => {
                state.loading = false;
                // Add room to list if returned from API
                if (action.payload.room) {
                    const exists = state.conversations.find(c => c.id === action.payload.room.id);
                    if (!exists) {
                        state.conversations.push(action.payload.room);
                    }
                }
            })
            .addCase(createGroupChat.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });

        // ===== JOIN GROUP CHAT =====
        builder
            .addCase(joinGroupChat.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(joinGroupChat.fulfilled, (state, action) => {
                state.loading = false;
                // Subscribe to room after joining
                if (action.payload.groupName) {
                    if (!state.subscribedConversationIds.includes(action.payload.groupName)) {
                        state.subscribedConversationIds.push(action.payload.groupName);
                    }
                }
            })
            .addCase(joinGroupChat.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });

        // ===== GET GROUP CHAT MESSAGES =====
        builder
            .addCase(getGroupChatMessages.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getGroupChatMessages.fulfilled, (state, action) => {
                state.loading = false;
                const { messages, page, context } = action.payload;

                const formattedMessages: Message[] = messages.map((raw: RawServerMessage) =>
                    transformServerMessage(raw, context)
                );

                if (page === 1) {
                    state.messages = formattedMessages;
                } else {
                    const existingIds = new Set(state.messages.map(m => m.id));
                    const newMessages = formattedMessages.filter((m: Message) => !existingIds.has(m.id));
                    state.messages = [...state.messages, ...newMessages];
                }
                state.currentPage = page;
                state.hasMoreMessages = messages.length > 0;
            })
            .addCase(getGroupChatMessages.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });

        // ===== GET PRIVATE CHAT MESSAGES =====
        builder
            .addCase(getPrivateChatMessages.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getPrivateChatMessages.fulfilled, (state, action) => {
                console.log('GET_PEOPLE_CHAT_MES fulfilled:', action.payload);

                state.loading = false;
                const { messages, page, context } = action.payload;
                const formattedMessages: Message[] = messages.map((raw: RawServerMessage) => {
                    const transformed = transformServerMessage(raw, context);
                    return transformed;
                });
                if (page === 1) {
                    state.messages = formattedMessages;
                } else {
                    const existingIds = new Set(state.messages.map(m => m.id));
                    const newMessages = formattedMessages.filter((m: Message) => !existingIds.has(m.id));
                    state.messages = [...state.messages, ...newMessages];
                }
                state.currentPage = page;
                state.hasMoreMessages = messages.length > 0;
            })
            .addCase(getPrivateChatMessages.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });

        // ===== SEND MESSAGE =====
        builder
            .addCase(sendChatMessage.pending, (state) => {
                state.error = null;
            })
            .addCase(sendChatMessage.fulfilled, (state, action) => {
                // Message will be received via WebSocket SEND_CHAT event
                // Just clear any error
                state.error = null;
            })
            .addCase(sendChatMessage.rejected, (state, action) => {
                state.error = action.payload as string;
            });

        // ===== CHECK USER EXIST =====
        builder
            .addCase(checkUserExist.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(checkUserExist.fulfilled, (state, action) => {
                state.loading = false;
                state.error = null;
            })
            .addCase(checkUserExist.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });

        // ===== CHECK USER ONLINE =====
        builder
            .addCase(checkUserOnline.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(checkUserOnline.fulfilled, (state, action) => {
                state.loading = false;
                state.error = null;
            })
            .addCase(checkUserOnline.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });

        // ===== START CHAT WITH USER =====
        builder
            .addCase(startChatWithUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(startChatWithUser.fulfilled, (state, action) => {
                state.loading = false;

                // Add user to userList if not exists
                const exists = state.userList.find(
                    u => u.username === action.payload.user.username
                );
                if (!exists) {
                    state.userList.push(action.payload.user);
                }

                // Set active room to this user
                state.activeConversationId = action.payload.user.username;

                // Load messages
                state.messages = action.payload.messages;
                state.currentPage = 1;
                state.hasMoreMessages = action.payload.messages.length > 0;
            })
            .addCase(startChatWithUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });

        // ===== GET USER LIST =====
        builder
            .addCase(getUserList.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getUserList.fulfilled, (state, action) => {
                state.loading = false;

                // Update users
                if (action.payload.users) {
                    state.userList = action.payload.users;
                }

                // Update conversations
                if (action.payload.conversations && action.payload.conversations.length > 0) {
                    action.payload.conversations.forEach((newConversation: any) => {
                        const exists = state.conversations.find(
                            c => c.id === newConversation.id || c.name === newConversation.name
                        );
                        if (!exists) {
                            state.conversations.push(newConversation);
                        }
                    });
                }
            })
            .addCase(getUserList.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
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
    addConversation,
    updateConversation,
    removeConversation,
    setConversations,
    setActiveConversation,
    incrementUnreadCount,
    addSubscribedConversation,
    removeSubscribedConversation,
    setSubscribedConversationIds,
    setLoading,
    setError,
    clearError,
    setCurrentPage,
    setHasMoreMessages,
    resetChat
} = chatSlice.actions;

// ===== SELECTORS =====
export const selectMessages = (state: { chat: ChatState }) => state.chat.messages;
export const selectConversations = (state: { chat: ChatState }) => state.chat.conversations;
export const selectActiveConversationId = (state: { chat: ChatState }) => state.chat.activeConversationId;
export const selectSubscribedConversationIds = (state: { chat: ChatState }) => state.chat.subscribedConversationIds;
export const selectChatLoading = (state: { chat: ChatState }) => state.chat.loading;
export const selectChatError = (state: { chat: ChatState }) => state.chat.error;
export const selectUserList = (state: { chat: ChatState }) => state.chat.userList;
export const selectCurrentPage = (state: { chat: ChatState }) => state.chat.currentPage;
export const selectHasMoreMessages = (state: { chat: ChatState }) => state.chat.hasMoreMessages;
// New selector for checking if a message is sending
export const selectIsMessageSending = (messageId: string) => (state: { chat: ChatState }) => {
    return state.chat.sendingMessages.includes(messageId);
};

// Advanced selectors
export const selectActiveConversationMessages = (state: { chat: ChatState }) => {
    const {messages, activeConversationId} = state.chat;
    if (!activeConversationId) return [];
    return messages
        .filter(m => m.receiver.id === activeConversationId || m.sender.id === activeConversationId)
        .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
};

export const selectActiveConversation = (state: { chat: ChatState }) => {
    const {conversations, activeConversationId, userList} = state.chat;
    if (!activeConversationId) return null;

    // Check if it's a room
    const conversation = conversations.find(c => c.id === activeConversationId);
    if (conversation) return conversation;

    // Check if it's a user (private chat)
    const user = userList.find(u => u.username === activeConversationId || u.id === activeConversationId);
    if (user) {
        // Convert user to room format
        return {
            id: user.username,
            name: user.displayName || user.username,
            type: 'private' as const,
            participants: [user.username],
            unreadCount: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
    }

    return null;
};

export const selectTotalUnreadCount = (state: { chat: ChatState }) => {
    return state.chat.conversations.reduce((total, conversation) => total + conversation.unreadCount, 0);
};

export const selectIsConversationSubscribed = (conversationId: string) => (state: { chat: ChatState }) => {
    return state.chat.subscribedConversationIds.includes(conversationId);
};

export const selectPrivateChats = (state: { chat: ChatState }) =>
    state.chat.conversations.filter(c => c.type === 'private');

export const selectGroupChats = (state: { chat: ChatState }) =>
    state.chat.conversations.filter(c => c.type === 'group');

export default chatSlice.reducer;