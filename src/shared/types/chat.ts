import { User } from './user';

export interface Message {
    id: string;
    content: string;
    sender: Pick<User, 'id' | 'username' | 'displayName' | 'avatar'>;
    roomId: string;
    timestamp: string;
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
    createdAt: string;
    updatedAt: string;
}

export type RoomType = 'private' | 'group';
