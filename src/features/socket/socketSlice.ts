import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type ConnectionStatus = 'connected' | 'disconnected' | 'reconnecting' | 'connecting';

interface SocketState {
    status: ConnectionStatus;
    error: string | null;
    reconnectAttempts: number;
    maxReconnectAttempts: number;
    lastConnected: String | null;
    lastDisconnected: String | null;
    isManualDisconnect: boolean;
}

const initialState: SocketState = {
    status: 'disconnected',
    error: null,
    reconnectAttempts: 0,
    maxReconnectAttempts: 5,
    lastConnected: null,
    lastDisconnected: null,
    isManualDisconnect: false
};

const socketSlice = createSlice({
    name: 'socket',
    initialState,
    reducers: {
        setConnecting: (state) => {
            state.status = 'connecting';
            state.error = null;
        },

        setConnected: (state) => {
            state.status = 'connected';
            state.error = null;
            state.reconnectAttempts = 0;
            state.lastConnected = new Date().toISOString();;
            state.isManualDisconnect = false;
        },

        setDisconnected: (state, action: PayloadAction<{ isManual?: boolean; error?: string }>) => {
            state.status = 'disconnected';
            state.lastDisconnected = new Date().toISOString();
            state.isManualDisconnect = action.payload.isManual || false;
            if (action.payload.error) {
                state.error = action.payload.error;
            }
        },

        setReconnecting: (state) => {
            state.status = 'reconnecting';
        },

        incrementReconnectAttempts: (state) => {
            state.reconnectAttempts++;
        },

        resetReconnectAttempts: (state) => {
            state.reconnectAttempts = 0;
        },

        setMaxReconnectAttempts: (state, action: PayloadAction<number>) => {
            state.maxReconnectAttempts = action.payload;
        },

        setSocketError: (state, action: PayloadAction<string>) => {
            state.error = action.payload;
        },

        clearSocketError: (state) => {
            state.error = null;
        },

        resetSocket: (state) => {
            state.status = 'disconnected';
            state.error = null;
            state.reconnectAttempts = 0;
            state.lastConnected = null;
            state.lastDisconnected = null;
            state.isManualDisconnect = false;
        }
    }
});

// ===== SELECTORS =====
export const selectSocketStatus = (state: { socket: SocketState }) =>
    state.socket.status;

export const selectSocketError = (state: { socket: SocketState }) =>
    state.socket.error;

export const selectReconnectAttempts = (state: { socket: SocketState }) =>
    state.socket.reconnectAttempts;

export const selectMaxReconnectAttempts = (state: { socket: SocketState }) =>
    state.socket.maxReconnectAttempts;

export const selectLastConnected = (state: { socket: SocketState }) =>
    state.socket.lastConnected;

export const selectLastDisconnected = (state: { socket: SocketState }) =>
    state.socket.lastDisconnected;

export const selectIsConnected = (state: { socket: SocketState }) =>
    state.socket.status === 'connected';

export const selectIsReconnecting = (state: { socket: SocketState }) =>
    state.socket.status === 'reconnecting';

export const selectIsManualDisconnect = (state: { socket: SocketState }) =>
    state.socket.isManualDisconnect;

export const selectConnectionInfo = (state: { socket: SocketState }) => ({
    status: state.socket.status,
    error: state.socket.error,
    reconnectAttempts: state.socket.reconnectAttempts,
    maxReconnectAttempts: state.socket.maxReconnectAttempts,
    lastConnected: state.socket.lastConnected,
    isConnected: state.socket.status === 'connected'
});

export const {
    setConnecting,
    setConnected,
    setDisconnected,
    setReconnecting,
    incrementReconnectAttempts,
    resetReconnectAttempts,
    setMaxReconnectAttempts,
    setSocketError,
    clearSocketError,
    resetSocket
} = socketSlice.actions;

export default socketSlice.reducer;