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

export interface CreateRoomData {
    name: string;
}

export interface JoinRoomData {
    name: string;
}

interface GetMessagesResponse {
    messages: any[];
}

interface CreateRoomResponse {
    room: any;
}

export class ChatService extends BaseService {
    async sendChat(data: SendChatData): Promise<void> {
        return this.send('SEND_CHAT', data);
    }

    async getRoomMessages(data: GetMessagesData): Promise<GetMessagesResponse> {
        return this.sendAndWaitForResponse<GetMessagesResponse>(
            'GET_ROOM_CHAT_MES',
            data
        );
    }

    async getPeopleMessages(data: GetMessagesData): Promise<any> {
        return this.sendAndWaitForResponse<GetMessagesResponse>(
            'GET_PEOPLE_CHAT_MES',
            data
        );
    }

    async createRoom(data: CreateRoomData): Promise<any> {
        return this.sendAndWaitForResponse<CreateRoomResponse>(
            'CREATE_ROOM',
            data
        );
    }

    async joinRoom(data: JoinRoomData): Promise<any> {
        return this.sendAndWaitForResponse('JOIN_ROOM', data);
    }

    onChatReceived(callback: (message: any) => void) {
        this.connection.on('SEND_CHAT', callback);
    }

    offChatReceived(callback?: (message: any) => void) {
        this.connection.off('SEND_CHAT', callback);
    }

}
