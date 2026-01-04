import { BaseService } from './BaseService';

export interface SendChatData {
    type: 'room' | 'people';
    to: string;
    mes: string;
}

export interface GetMessagesData {
    name: string;
    page: number;
}

export interface CreateGroupChatData {
    name: string;
}

export interface JoinGroupChatData {
    name: string;
}

interface GetMessagesResponse {
    messages: any[];
}

interface CreateGroupChatResponse {
    room: any;
}

export class ChatService extends BaseService {
    async sendChat(data: SendChatData): Promise<void> {
        return this.send('SEND_CHAT', data);
    }

    async getGroupChatMessages(data: GetMessagesData): Promise<GetMessagesResponse> {
        return this.sendAndWaitForResponse<GetMessagesResponse>(
            'GET_ROOM_CHAT_MES',
            data
        );
    }

    async getPrivateChatMessages(data: GetMessagesData): Promise<any> {
        return this.sendAndWaitForResponse<GetMessagesResponse>(
            'GET_PEOPLE_CHAT_MES',
            data
        );
    }

    async createGroupChat(data: CreateGroupChatData): Promise<any> {
        return this.sendAndWaitForResponse<CreateGroupChatResponse>(
            'CREATE_ROOM',
            data
        );
    }

    async joinGroupChat(data: JoinGroupChatData): Promise<any> {
        return this.sendAndWaitForResponse('JOIN_ROOM', data);
    }

    onChatReceived(callback: (message: any) => void) {
        this.connection.on('SEND_CHAT', callback);
    }

    offChatReceived(callback?: (message: any) => void) {
        this.connection.off('SEND_CHAT', callback);
    }

}
