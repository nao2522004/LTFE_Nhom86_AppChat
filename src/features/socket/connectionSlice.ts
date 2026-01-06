import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type ConnectionStatus = 'connected' | 'disconnected' | 'reconnecting' | 'connecting';

interface ConnectionState {
    status: ConnectionStatus;
    error: string | null;
    reconnectAttempts: number;
    maxReconnectAttempts: number;
    lastConnected: String | null;
    lastDisconnected: String | null;
    isManualDisconnect: boolean;
}

// ===== INITIAL STATE =====
const initialState: ConnectionState = {
    status: 'disconnected',
    error: null,
    reconnectAttempts: 0,
    maxReconnectAttempts: 5,
    lastConnected: null,
    lastDisconnected: null,
    isManualDisconnect: false
};

// ===== SLICE =====
const connectionSlice = createSlice({
    name: 'connection',
    initialState,
    reducers: {
        // ===== CONNECTION STATUS =====
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
            state.lastDisconnected = new Date().toISOString();;
            state.isManualDisconnect = action.payload.isManual || false;

            if (action.payload.error) {
                state.error = action.payload.error;
            }
        },

        setReconnecting: (state) => {
            state.status = 'reconnecting';
        },

        // ===== RECONNECTION =====
        incrementReconnectAttempts: (state) => {
            state.reconnectAttempts++;
        },

        resetReconnectAttempts: (state) => {
            state.reconnectAttempts = 0;
        },

        setMaxReconnectAttempts: (state, action: PayloadAction<number>) => {
            state.maxReconnectAttempts = action.payload;
        },

        // ===== ERROR =====
        setConnectionError: (state, action: PayloadAction<string>) => {
            state.error = action.payload;
        },

        clearConnectionError: (state) => {
            state.error = null;
        },

        // ===== RESET =====
        resetConnection: (state) => {
            state.status = 'disconnected';
            state.error = null;
            state.reconnectAttempts = 0;
            state.lastConnected = null;
            state.lastDisconnected = null;
            state.isManualDisconnect = false;
        }
    }
});

// ===== ACTIONS =====
export const {
    setConnecting,
    setConnected,
    setDisconnected,
    setReconnecting,
    incrementReconnectAttempts,
    resetReconnectAttempts,
    setMaxReconnectAttempts,
    setConnectionError,
    clearConnectionError,
    resetConnection
} = connectionSlice.actions;

// ===== SELECTORS =====
export const selectConnectionStatus = (state: { connection: ConnectionState }) =>
    state.connection.status;

export const selectConnectionError = (state: { connection: ConnectionState }) =>
    state.connection.error;

export const selectReconnectAttempts = (state: { connection: ConnectionState }) =>
    state.connection.reconnectAttempts;

export const selectMaxReconnectAttempts = (state: { connection: ConnectionState }) =>
    state.connection.maxReconnectAttempts;

export const selectLastConnected = (state: { connection: ConnectionState }) =>
    state.connection.lastConnected;

export const selectLastDisconnected = (state: { connection: ConnectionState }) =>
    state.connection.lastDisconnected;

export const selectIsConnected = (state: { connection: ConnectionState }) =>
    state.connection.status === 'connected';

export const selectIsReconnecting = (state: { connection: ConnectionState }) =>
    state.connection.status === 'reconnecting';

export const selectIsManualDisconnect = (state: { connection: ConnectionState }) =>
    state.connection.isManualDisconnect;

export const selectConnectionInfo = (state: { connection: ConnectionState }) => ({
    status: state.connection.status,
    error: state.connection.error,
    reconnectAttempts: state.connection.reconnectAttempts,
    maxReconnectAttempts: state.connection.maxReconnectAttempts,
    lastConnected: state.connection.lastConnected,
    isConnected: state.connection.status === 'connected'
});

export default connectionSlice.reducer;