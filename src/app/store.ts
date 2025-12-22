import { configureStore } from '@reduxjs/toolkit';
import userReducer from '../features/user/userSlice';
import authReducer from '../features/auth/authSlice';
import chatReducer from '../features/chat/chatSlice';
import connectionReducer from '../features/connectionSocket/connectionSlice';

// ===== CONFIGURE STORE =====
export const store = configureStore({
    reducer: {
        user: userReducer,
        auth: authReducer,
        chat: chatReducer,
        connection: connectionReducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                // Ignore these action types for Date objects
                ignoredActions: [
                    'chat/addMessage',
                    'chat/setMessages',
                    'connectionSocket/setConnected',
                    'connectionSocket/setDisconnected'
                ],
                // Ignore these field paths in all actions
                ignoredActionPaths: ['payload.timestamp', 'payload.lastConnected', 'payload.lastDisconnected'],
                // Ignore these paths in the state
                ignoredPaths: [
                    'chat.messages',
                    'connectionSocket.lastConnected',
                    'connectionSocket.lastDisconnected'
                ],
            },
        }),
    devTools: process.env.NODE_ENV !== 'production',
});

// ===== TYPES =====
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// ===== STORE TYPES EXPORT =====
export default store;