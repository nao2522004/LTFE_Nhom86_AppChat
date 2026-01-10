import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import chatReducer from '../features/chat/chatSlice';
import uiReducer from '../features/ui/uiSlice';
import socketReducer from '../features/socket/socketSlice';

// ===== CONFIGURE STORE =====
export const store = configureStore({
    reducer: {
        auth: authReducer,
        chat: chatReducer,
        ui: uiReducer,
        socket: socketReducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: ['chat/addMessage', 'socket/setConnected'],
                ignoredPaths: ['chat.messages.byId', 'socket.lastConnected'],
            },
        }),
    devTools: process.env.NODE_ENV !== 'production',
});

// ===== TYPES =====
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// ===== STORE TYPES EXPORT =====
export default store;