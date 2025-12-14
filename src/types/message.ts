// ===== MESSAGE TYPES =====
import {User} from "./user";

export type MessageType = 'text' | 'image' | 'link' | 'emoji' | 'file';
export type MessageStatus = 'sending' | 'sent' | 'failed';

export interface Message {
    id: string;
    content: string;
    sender: User;
    roomId: string;
    timestamp: Date;
    status: MessageStatus;
    type: MessageType;
}