// ===== SHARED TYPES (Cả 3 người dùng chung) =====

// ===== MESSAGE TYPES =====
export type MessageType = 'text' | 'image' | 'link' | 'emoji' | 'file';
export type MessageStatus = 'sending' | 'sent' | 'failed';

export interface Message {
    id: string;  // ✅ Dùng string cho flexibility và safety
    content: string;
    sender: User;
    roomId: string;
    timestamp: Date;
    status: MessageStatus;
    type: MessageType;
}

// ===== USER TYPES =====
export type UserStatus = 'online' | 'offline' | 'away';

export interface User {
    id: string;  // ✅ Consistent với Chat
    username: string;
    displayName?: string;
    avatar?: string;
    email?: string;
    bio?: string;
    status: UserStatus;
    isOnline?: boolean;
    lastSeen?: Date;
}

export interface UserSettings {
    notifications: boolean;
    soundEnabled: boolean;
    theme: 'light' | 'dark';
    language: string;
}

// ===== WEBSOCKET MESSAGE TYPES =====
export type WebSocketEventType =
    | 'LOGIN'
    | 'REGISTER'
    | 'LOGOUT'
    | 'SEND_MESSAGE'
    | 'MESSAGE_RECEIVED'
    | 'TYPING_START'
    | 'TYPING_STOP'
    | 'USER_ONLINE'
    | 'USER_OFFLINE'
    | 'SUBSCRIBE'
    | 'UNSUBSCRIBE'
    | 'ERROR'
    | 'PING'
    | 'PONG';

export interface WebSocketMessage<T = any> {
    action: 'onchat';
    data: {
        event: WebSocketEventType;
        data: T;
    };
}

export interface WebSocketResponse<T = any> {
    event: WebSocketEventType;
    status?: 'success' | 'error';
    message?: string;
    data?: T;
}

// ===== CONNECTION STATE TYPES =====
export type ConnectionStatus = 'connected' | 'disconnected' | 'reconnecting' | 'connecting';

export interface ConnectionState {
    status: ConnectionStatus;
    error: string | null;
    reconnectAttempts: number;
    lastConnected: Date | null;
}

// ===== ROOM/CHANNEL TYPES =====
export type RoomType = 'private' | 'group' | 'channel';

export interface Room {
    id: string | number;  // Support both string and number
    name: string;
    type: RoomType;
    participants: string[];
    lastMessage?: Message;
    unreadCount: number;
    createdAt: Date;
    updatedAt: Date;
}

// ===== AUTH TYPES =====
export interface LoginCredentials {
    user: string;
    pass: string;
}

export interface RegisterData {
    user: string;
    pass: string;
    name?: string;
    email?: string;
}

export interface AuthResponse {
    success: boolean;
    token: string;
    user: User;
    message?: string;
}

// ===== TYPING INDICATOR TYPES =====
export interface TypingIndicator {
    userId: string;
    username: string;
    roomId: string;
    timestamp: Date;
}

// ===== API RESPONSE TYPES =====
export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}

export interface PaginatedResponse<T> {
    data: T[];
    page: number;
    totalPages: number;
    totalItems: number;
    hasMore: boolean;
}

// ===== ERROR TYPES =====
export interface AppError {
    code: string;
    message: string;
    details?: any;
}

// ===== NOTIFICATION TYPES =====
export type NotificationType = 'info' | 'success' | 'warning' | 'error';

export interface Notification {
    id: string;
    type: NotificationType;
    message: string;
    duration?: number;
    timestamp: Date;
}

// ===== REDUX STATE TYPES =====
export interface RootState {
    auth: AuthState;
    chat: ChatState;
    connection: ConnectionState;
    user: UserState;
}

export interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    loading: boolean;
    error: string | null;
    wsConnected: boolean;
}

export interface ChatState {
    messages: Message[];
    rooms: Room[];
    activeRoomId: string | null;
    subscribedChannels: string[];
    loading: boolean;
    error: string | null;
}

export interface UserState {
    currentUser: User | null;
    settings: UserSettings;
    loading: boolean;
    error: string | null;
}

// ===== UTILITY TYPES =====
export type DeepPartial<T> = {
    [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type Nullable<T> = T | null;

export type AsyncState<T> = {
    data: T | null;
    loading: boolean;
    error: string | null;
};

// ===== FORM TYPES =====
export interface LoginFormData {
    user: string;
    pass: string;
}

export interface RegisterFormData {
    name: string;
    email: string;
    user: string;
    pass: string;
    confirmPass: string;
}

export interface MessageInputData {
    content: string;
    type: MessageType;
    roomId: string;
}

// ===== FILE UPLOAD TYPES =====
export interface FileUpload {
    file: File;
    progress: number;
    status: 'pending' | 'uploading' | 'completed' | 'failed';
    url?: string;
    error?: string;
}

// ===== SEARCH TYPES =====
export interface SearchQuery {
    query: string;
    filters?: {
        roomId?: string;
        userId?: string;
        type?: MessageType;
        dateFrom?: Date;
        dateTo?: Date;
    };
}

export interface SearchResult<T> {
    results: T[];
    total: number;
    query: string;
}

// ===== EVENT HANDLER TYPES =====
export type EventHandler<T = void> = (data: T) => void;
export type AsyncEventHandler<T = void> = (data: T) => Promise<void>;

// ===== WEBSOCKET HOOK TYPES =====
export interface WebSocketHookReturn {
    isConnected: boolean;
    connectionStatus: ConnectionStatus;
    send: (message: WebSocketMessage) => Promise<void>;
    on: (event: string, handler: EventHandler<any>) => void;
    off: (event: string, handler?: EventHandler<any>) => void;
}

// ===== VALIDATION TYPES =====
export interface ValidationError {
    field: string;
    message: string;
}

export interface ValidationResult {
    isValid: boolean;
    errors: ValidationError[];
}

// ===== DATE/TIME TYPES =====
export type TimeUnit = 'second' | 'minute' | 'hour' | 'day' | 'week' | 'month' | 'year';

export interface TimeAgo {
    value: number;
    unit: TimeUnit;
    text: string;
}

// ===== PERMISSION TYPES =====
export type Permission =
    | 'message.send'
    | 'message.edit'
    | 'message.delete'
    | 'room.create'
    | 'room.edit'
    | 'room.delete'
    | 'user.ban'
    | 'user.kick';

export interface UserPermissions {
    userId: string;
    roomId: string;
    permissions: Permission[];
}

// ===== EXPORT ALL =====
export default {
    // This allows importing all types as a namespace
    // import Types from './shared.types';
    // Types.Chat, Types.User, etc.
};