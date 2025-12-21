export interface Message {
    id: string;
    content: string;
    sender: {
        id: string;
        username: string;
        displayName?: string;
        avatar?: string;
    };
    roomId: string;
    timestamp: Date;
    status: MessageStatus;
    type: MessageType;
}

export type MessageStatus = 'sending' | 'sent' | 'failed';
export type MessageType = 'text' | 'image' | 'link' | 'emoji';

export interface Room {
    id: string;
    name: string;
    type: RoomType;
    participants: string[];
    lastMessage?: Message;
    unreadCount: number;
    createdAt?: Date;
    updatedAt?: Date;
}

export type RoomType = 'private' | 'group';