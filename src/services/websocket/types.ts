// Socket Event Types
export interface SocketResponse<T = any> {
    success: boolean;
    message?: string;
    data?: T;
    error?: string;
}

// Auth Events
export interface LoginRequest {
    email: string;
    password: string;
}

export interface RegisterRequest {
    username: string;
    email: string;
    password: string;
    displayName?: string;
}

export interface AuthResponse {
    success: boolean;
    user: any;
    token: string;
    message?: string;
}

// Chat Events
export interface SendMessageRequest {
    conversationId: string;
    content: string;
    type?: 'text' | 'image' | 'file';
}

export interface MessageReceivedData {
    id: string;
    conversationId: string;
    senderId: string;
    content: string;
    type: string;
    createdAt: string;
}

// Typing Events
export interface TypingData {
    conversationId: string;
    userId: string;
    username: string;
}

// User Status Events
export interface UserStatusData {
    userId: string;
    isOnline: boolean;
    lastSeen?: string;
}

// Conversation Events
export interface ConversationData {
    id: string;
    name?: string;
    type: 'people' | 'group';
    participants: string[];
    lastMessage?: any;
    createdAt: string;
    updatedAt: string;
}

// Socket Events Map
export enum SocketEvents {
    // Auth
    AUTH_LOGIN = 'auth:login',
    AUTH_REGISTER = 'auth:register',
    AUTH_LOGOUT = 'auth:logout',
    AUTH_ME = 'auth:me',
    
    // Messages
    MESSAGE_SEND = 'message:send',
    MESSAGE_RECEIVED = 'message:received',
    MESSAGE_DELETE = 'message:delete',
    MESSAGE_EDIT = 'message:edit',
    
    // Typing
    TYPING_START = 'typing:start',
    TYPING_STOP = 'typing:stop',
    
    // User Status
    USER_ONLINE = 'user:online',
    USER_OFFLINE = 'user:offline',
    
    // Conversations
    CONVERSATION_CREATED = 'conversation:created',
    CONVERSATION_UPDATED = 'conversation:updated',
    CONVERSATION_DELETED = 'conversation:deleted',
    CONVERSATION_JOIN = 'conversation:join',
    CONVERSATION_LEAVE = 'conversation:leave',
    
    // Connection
    CONNECT = 'connect',
    DISCONNECT = 'disconnect',
    CONNECT_ERROR = 'connect_error',
    ERROR = 'error'
}