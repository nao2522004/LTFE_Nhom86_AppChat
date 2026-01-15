import { User } from './user';

/**
 * Message Interface - App format
 * Đây là format chuẩn được sử dụng trong toàn bộ app
 */
export interface Message {
    id: string;
    content: string;
    contentData?: MessageContent;
    sender: MessageSender;
    receiver: MessageReceiver;
    timestamp: string;
    status: MessageStatus;
    type: MessageType;

    // Metadata (optional)
    replyTo?: string;
    isEdited?: boolean;
    editedAt?: string;
    reactions?: MessageReaction[];
}

/**
 * Message Reactions
 */
export interface MessageReaction {
    emoji: string;                 // '👍', '❤️', '😂'...
    users: string[];               // Danh sách user IDs đã react
    count: number;                 // Số lượng reactions
}

/**
 * Message Sender - Thông tin người gửi
 */
export interface MessageSender {
    id: string;
    username: string;
    displayName?: string;
    avatar?: string;
}

export interface MessageReceiver {
    id: string;
    name: string;
    type: 'people' | 'room';
    avatar?: string;
}

export interface MessageReaction {
    emoji: string;
    users: string[];
    count: number;
}

export type MessageStatus = 'sending' | 'sent' | 'failed';

export type MessageType =
    | 'text'
    | 'image'
    | 'video'
    | 'audio'
    | 'file'
    | 'link'
    | 'location'
    | 'contact';

export type MessageContent =
    | TextContent
    | MediaContent
    | FileContent
    | LinkContent
    | LocationContent
    | ContactContent;

export interface TextContent {
    type: 'text';
    text: string;
}

export interface MediaContent {
    type: 'image' | 'video' | 'audio';
    url: string;
    thumbnail?: string;
    duration?: number;
    size?: number;
    width?: number;
    height?: number;
    mimeType?: string;
}

export interface FileContent {
    type: 'file';
    url: string;
    filename: string;
    size: number;
    mimeType?: string;
}

export interface LinkContent {
    type: 'link';
    url: string;
    title?: string;
    description?: string;
    image?: string;
    siteName?: string;
}

export interface LocationContent {
    type: 'location';
    latitude: number;
    longitude: number;
    address?: string;
    name?: string;
}

export interface ContactContent {
    type: 'contact';
    name: string;
    phone?: string;
    email?: string;
    avatar?: string;
}

export interface Conversation {
    id: string;
    name: string;
    type: ConversationType;
    participants: string[];
    lastMessage?: Message;
    unreadCount: number;
    createdAt: string;
    updatedAt: string;
}

export type ConversationType = 'people' | 'room';

/**
 * Raw Message từ Server
 * Format gốc khi nhận từ WebSocket response
 */
export interface RawServerMessage {
    id: number;
    mes: string;
    name: string;
    to: string;
    createAt: string;
    type: number;

    url?: string;
    filename?: string;
    size?: number;
    duration?: number;
    thumbnail?: string;
    width?: number;
    height?: number;
    mimeType?: string;

    replyTo?: number;
    isEdited?: boolean;
    editedAt?: string;
}

/**
 * Helper function để xác định recipient type từ context
 * Cần Room/User list để check
 */
export interface TransformContext {
    conversations: Array<{ id: string; name: string }>;
    users: Array<{ id: string; username: string }>;
}

/**
 * Message Types - Các loại tin nhắn hỗ trợ
 */
function mapMessageType(type: number): MessageType {
    switch (type) {
        case 0: return 'text';
        case 1: return 'image';
        case 2: return 'video';
        case 3: return 'audio';
        case 4: return 'file';
        case 5: return 'link';
        case 6: return 'location';
        case 7: return 'contact';
        default: return 'text';
    }
}

function parseMessageContent(raw: RawServerMessage): MessageContent | undefined {
    switch (raw.type) {
        case 0:
            return {
                type: 'text',
                text: raw.mes
            };

        case 1:
        case 2:
        case 3:
            if (!raw.url) return undefined;
            return {
                type: mapMessageType(raw.type) as 'image' | 'video' | 'audio',
                url: raw.url,
                thumbnail: raw.thumbnail,
                duration: raw.duration,
                size: raw.size,
                width: raw.width,
                height: raw.height,
                mimeType: raw.mimeType
            };

        case 4:
            if (!raw.url || !raw.filename) return undefined;
            return {
                type: 'file',
                url: raw.url,
                filename: raw.filename,
                size: raw.size || 0,
                mimeType: raw.mimeType
            };

        case 5:
            try {
                const linkData = JSON.parse(raw.mes);
                return {
                    type: 'link',
                    url: linkData.url || raw.url || '',
                    title: linkData.title,
                    description: linkData.description,
                    image: linkData.image,
                    siteName: linkData.siteName
                };
            } catch {
                return {
                    type: 'link',
                    url: raw.url || raw.mes
                };
            }

        case 6:
            try {
                const locData = JSON.parse(raw.mes);
                return {
                    type: 'location',
                    latitude: locData.latitude,
                    longitude: locData.longitude,
                    address: locData.address,
                    name: locData.name
                };
            } catch {
                return undefined;
            }

        case 7:
            try {
                const contactData = JSON.parse(raw.mes);
                return {
                    type: 'contact',
                    name: contactData.name,
                    phone: contactData.phone,
                    email: contactData.email,
                    avatar: contactData.avatar
                };
            } catch {
                return undefined;
            }

        default:
            return undefined;
    }
}

function determineReceiverType(
    to: string,
    context?: TransformContext
): 'people' | 'room' {
    if (context) {
        const isRoom = context.conversations.some(c => c.name === to || c.id === to);
        if (isRoom) return 'room';

        const isUser = context.users.some(u => u.username === to || u.id === to);
        if (isUser) return 'people';
    }

    if (/^\d+$/.test(to)) {
        return 'people';
    }

    if (to.includes('@')) {
        return 'people';
    }

    return 'room';
}

export function transformServerMessage(
    raw: RawServerMessage,
    context?: TransformContext
): Message {
    const contentData = parseMessageContent(raw);
    const receiverType = determineReceiverType(raw.to, context);

    let receiverName = raw.to;
    let receiverAvatar: string | undefined;

    if (context) {
        if (receiverType === 'room') {
            const conversation = context.conversations.find(c => c.name === raw.to || c.id === raw.to);
            if (conversation) receiverName = conversation.name;
        } else {
            const user = context.users.find(u => u.username === raw.to || u.id === raw.to);
            if (user) {
                receiverName = user.username;
                receiverAvatar = `https://i.pravatar.cc/150?u=${user.username}`;
            }
        }
    }

    return {
        id: raw.id.toString(),
        content: raw.mes,
        contentData,
        sender: {
            id: raw.name,
            username: raw.name,
            displayName: raw.name,
            avatar: `https://i.pravatar.cc/150?u=${raw.name}`
        },
        receiver: {
            id: raw.to,
            name: receiverName,
            type: receiverType,
            avatar: receiverAvatar
        },
        timestamp: raw.createAt,
        status: 'sent',
        type: mapMessageType(raw.type),

        replyTo: raw.replyTo?.toString(),
        isEdited: raw.isEdited,
        editedAt: raw.editedAt,
        reactions: []
    };
}

export function isRawServerMessage(obj: any): obj is RawServerMessage {
    return (
        typeof obj === 'object' &&
        typeof obj.id === 'number' &&
        typeof obj.mes === 'string' &&
        typeof obj.name === 'string' &&
        typeof obj.to === 'string' &&
        typeof obj.createAt === 'string' &&
        typeof obj.type === 'number'
    );
}

export function safeTransformMessage(raw: any, context?: TransformContext): Message | null {
    if (!isRawServerMessage(raw)) {
        console.error('Invalid message format:', raw);
        return null;
    }
    return transformServerMessage(raw, context);
}

export interface RawServerRoomMessage {
    id: number;
    name: string;
    type: number;
    to: string;
    mes: string;
    createAt: string;
}

export function transformServerRoomMessage(
    raw: RawServerRoomMessage,
    context?: TransformContext
): Message {
    const senderId = raw.name;

    return {
        id: String(raw.id),
        content: raw.mes,
        contentData: {
            type: 'text',
            text: raw.mes
        },
        sender: {
            id: senderId,
            username: senderId
        },
        receiver: {
            id: raw.to,
            name: raw.to,
            type: 'room'
        },
        timestamp: raw.createAt,
        status: 'sent',
        type: 'text',
        reactions: []
    };
}

export interface RoomUser {
    id: number;
    name: string;
}

export interface JoinRoomDetail {
    id: number;
    name: string;
    own: string;
    createTime: string;
    userList: RoomUser[];
    chatData: RawServerRoomMessage[]; // Sử dụng interface bạn đã có ở trên
}