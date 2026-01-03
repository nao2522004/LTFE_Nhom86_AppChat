import {createAsyncThunk, createSlice, PayloadAction} from '@reduxjs/toolkit';
import {Message, Room} from "../../shared/types/chat";
import websocketService from "../../services/websocket/MainService";

interface ChatState {
    messages: Message[];
    rooms: Room[];
    activeRoomId: string | null;
    activeRoomIds: string[];
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
    rooms: [],
    activeRoomId: null,
    activeRoomIds: [],
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
export const createRoom = createAsyncThunk(
    'chat/createRoom',
    async (roomName: string, {rejectWithValue}) => {
        try {
            const response = await websocketService.createRoom(roomName);
            return response;
        } catch (error: any) {
            return rejectWithValue(error.message || 'Failed to create room');
        }
    }
);

/**
 * EVENT: JOIN_ROOM API
 * Request: DATA: { "name": "ABC" }
 */
export const joinRoom = createAsyncThunk(
    'chat/joinRoom',
    async (roomName: string, {rejectWithValue}) => {
        try {
            const response = await websocketService.joinRoom(roomName);
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
export const getRoomMessages = createAsyncThunk(
    'chat/getRoomMessages',
    async ({roomName, page}: { roomName: string; page: number }, {rejectWithValue}) => {
        try {
            const response = await websocketService.getRoomMessages({roomName, page});
            return {roomName, messages: response.messages || [], page};
        } catch (error: any) {
            return rejectWithValue(error.message || 'Failed to get room messages');
        }
    }
);

/**
 * GET_PEOPLE_CHAT_MES API
 * Request: { "name": "ti", "page": 1 }
 */
export const getPeopleMessages = createAsyncThunk(
    'chat/getPeopleMessages',
    async ({userName, page}: { userName: string; page: number }, {rejectWithValue}) => {
        try {
            const response = await websocketService.getPeopleMessages({userName, page});
            return {userName, messages: response.messages || [], page};
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
 * CHECK_USER API
 * Request: { "user": "ti" }
 */
export const checkUser = createAsyncThunk(
    'chat/checkUser',
    async (username: string, {rejectWithValue}) => {
        try {
            const response = await websocketService.checkUser(username);
            return response;
        } catch (error: any) {
            return rejectWithValue(error.message || 'Failed to check user');
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
            console.log('getUserList thunk response:', response);
            return {
                users: response.users || [],
                rooms: response.rooms || []
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

        // ===== ACTIVE ROOM IDS =====
        addActiveRoom: (state, action: PayloadAction<string>) => {
            if (!state.activeRoomIds.includes(action.payload)) {
                state.activeRoomIds.push(action.payload);
            }
        },

        removeActiveRoom: (state, action: PayloadAction<string>) => {
            state.activeRoomIds = state.activeRoomIds.filter(
                id => id !== action.payload
            );
        },

        setActiveRoomIds: (state, action: PayloadAction<string[]>) => {
            state.activeRoomIds = action.payload;
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
            state.rooms = [];
            state.activeRoomId = null;
            state.activeRoomIds = [];
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
            .addCase(createRoom.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createRoom.fulfilled, (state, action) => {
                state.loading = false;
                // Add room to list if returned from API
                if (action.payload.room) {
                    const exists = state.rooms.find(r => r.id === action.payload.room.id);
                    if (!exists) {
                        state.rooms.push(action.payload.room);
                    }
                }
            })
            .addCase(createRoom.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });

        // ===== JOIN ROOM =====
        builder
            .addCase(joinRoom.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(joinRoom.fulfilled, (state, action) => {
                state.loading = false;
                // Subscribe to room after joining
                if (action.payload.roomName) {
                    if (!state.activeRoomIds.includes(action.payload.roomName)) {
                        state.activeRoomIds.push(action.payload.roomName);
                    }
                }
            })
            .addCase(joinRoom.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });

        // ===== GET ROOM MESSAGES =====
        builder
            .addCase(getRoomMessages.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getRoomMessages.fulfilled, (state, action) => {
                state.loading = false;
                const {messages, page} = action.payload;

                if (page === 1) {
                    // Replace messages if page 1
                    state.messages = messages;
                } else {
                    // Append for pagination
                    const newMessages = messages.filter(
                        (msg: Message) => !state.messages.find(m => m.id === msg.id)
                    );
                    state.messages = [...state.messages, ...newMessages];
                }

                state.currentPage = page;
                state.hasMoreMessages = messages.length > 0;
            })
            .addCase(getRoomMessages.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });

        // ===== GET PEOPLE MESSAGES =====
        builder
            .addCase(getPeopleMessages.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getPeopleMessages.fulfilled, (state, action) => {
                state.loading = false;
                const {messages, page} = action.payload;

                if (page === 1) {
                    state.messages = messages;
                } else {
                    const newMessages = messages.filter(
                        (msg: Message) => !state.messages.find(m => m.id === msg.id)
                    );
                    state.messages = [...state.messages, ...newMessages];
                }

                state.currentPage = page;
                state.hasMoreMessages = messages.length > 0;
            })
            .addCase(getPeopleMessages.rejected, (state, action) => {
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

        // ===== CHECK USER =====
        builder
            .addCase(checkUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(checkUser.fulfilled, (state) => {
                state.loading = false;
            })
            .addCase(checkUser.rejected, (state, action) => {
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

                // Update rooms
                if (action.payload.rooms && action.payload.rooms.length > 0) {
                    action.payload.rooms.forEach((newRoom: any) => {
                        const exists = state.rooms.find(
                            r => r.id === newRoom.id || r.name === newRoom.name
                        );
                        if (!exists) {
                            state.rooms.push(newRoom);
                        }
                    });
                }

                console.log('Loaded:', {
                    usersCount: state.userList.length,
                    roomsCount: state.rooms.length
                });
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
    addRoom,
    updateRoom,
    removeRoom,
    setRooms,
    setActiveRoom,
    incrementUnreadCount,
    addActiveRoom,
    removeActiveRoom,
    setActiveRoomIds,
    setLoading,
    setError,
    clearError,
    setCurrentPage,
    setHasMoreMessages,
    resetChat
} = chatSlice.actions;

// ===== SELECTORS =====
export const selectMessages = (state: { chat: ChatState }) => state.chat.messages;
export const selectRooms = (state: { chat: ChatState }) => state.chat.rooms;
export const selectActiveRoomId = (state: { chat: ChatState }) => state.chat.activeRoomId;
export const selectSubscribedChannels = (state: { chat: ChatState }) => state.chat.activeRoomIds;
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
export const selectActiveRoomMessages = (state: { chat: ChatState }) => {
    const {messages, activeRoomId} = state.chat;
    if (!activeRoomId) return [];
    return messages.filter(m => m.roomId === activeRoomId);
};

export const selectActiveRoom = (state: { chat: ChatState }) => {
    const {rooms, activeRoomId} = state.chat;
    if (!activeRoomId) return null;
    return rooms.find(r => r.id === activeRoomId) || null;
};

export const selectTotalUnreadCount = (state: { chat: ChatState }) => {
    return state.chat.rooms.reduce((total, room) => total + room.unreadCount, 0);
};

export const selectIsRoomActive = (roomId: string) => (state: { chat: ChatState }) => {
    return state.chat.activeRoomIds.includes(roomId);
};

export default chatSlice.reducer;