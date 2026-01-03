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
            const prevStatus = state.status;
            state.status = 'connecting';
            state.error = null;

            console.log('%c[REDUX ACTION] setConnecting',
                'background: #3498db; color: white; padding: 2px 6px; border-radius: 3px;',
                {
                    prevStatus,
                    newStatus: 'connecting',
                    timestamp: new Date().toISOString()
                }
            );
        },

        setConnected: (state) => {
            const prevStatus = state.status;
            state.status = 'connected';
            state.error = null;
            state.reconnectAttempts = 0;
            state.lastConnected = new Date().toISOString();;
            state.isManualDisconnect = false;
            console.log('%c[REDUX ACTION] setConnected',
                'background: #28a745; color: white; padding: 2px 6px; border-radius: 3px;',
                {
                    prevStatus,
                    newStatus: 'connected',
                    timestamp: new Date().toISOString(),
                    stackTrace: new Error().stack?.split('\n').slice(1, 4).join('\n')
                }
            );
        },

        setDisconnected: (state, action: PayloadAction<{ isManual?: boolean; error?: string }>) => {
            const prevStatus = state.status;
            state.status = 'disconnected';
            state.lastDisconnected = new Date().toISOString();;
            state.isManualDisconnect = action.payload.isManual || false;

            if (action.payload.error) {
                state.error = action.payload.error;
            }

            console.log('%c[REDUX ACTION] setDisconnected',
                'background: #dc3545; color: white; padding: 2px 6px; border-radius: 3px;',
                {
                    prevStatus,
                    newStatus: 'disconnected',
                    isManual: state.isManualDisconnect,
                    error: state.error,
                    timestamp: new Date().toISOString()
                }
            );
        },

        setReconnecting: (state) => {
            const prevStatus = state.status;
            state.status = 'reconnecting';
            console.log('%c[REDUX ACTION] setReconnecting',
                'background: #f39c12; color: white; padding: 2px 6px; border-radius: 3px;',
                {
                    prevStatus,
                    newStatus: 'reconnecting',
                    attempts: state.reconnectAttempts + 1,
                    max: state.maxReconnectAttempts,
                    timestamp: new Date().toISOString()
                }
            );
        },

        // ===== RECONNECTION =====
        incrementReconnectAttempts: (state) => {
            state.reconnectAttempts++;
            console.log(`%c[REDUX ACTION] incrementReconnectAttempts`,
                'background: #9b59b6; color: white; padding: 2px 6px; border-radius: 3px;',
                {
                    attempts: state.reconnectAttempts,
                    max: state.maxReconnectAttempts
                }
            );
        },

        resetReconnectAttempts: (state) => {
            const prevAttempts = state.reconnectAttempts;
            state.reconnectAttempts = 0;
            console.log('%c[REDUX ACTION] resetReconnectAttempts',
                'background: #1abc9c; color: white; padding: 2px 6px; border-radius: 3px;',
                {
                    prevAttempts,
                    newAttempts: 0
                }
            );
        },

        setMaxReconnectAttempts: (state, action: PayloadAction<number>) => {
            state.maxReconnectAttempts = action.payload;
        },

        // ===== ERROR =====
        setConnectionError: (state, action: PayloadAction<string>) => {
            state.error = action.payload;
            console.error('%c[REDUX ACTION] setConnectionError',
                'background: #e74c3c; color: white; padding: 2px 6px; border-radius: 3px;',
                action.payload
            );
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
            console.log('%c[REDUX ACTION] resetConnection',
                'background: #95a5a6; color: white; padding: 2px 6px; border-radius: 3px;',
                'Connection state reset'
            );
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