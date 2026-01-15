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



interface CreateRoomResponse {
    room: any;
}

export class ChatService extends BaseService {
    async sendChat(data: SendChatData): Promise<void> {
        return this.send('SEND_CHAT', data);
    }

    async getRoomChatMessages(data: GetMessagesData): Promise<any> {
        const response = await this.sendAndWaitForResponse<any>(
            'GET_ROOM_CHAT_MES',
            data
        );

        return { data: response.data };
    }

    async getPeopleChatMessages(data: GetMessagesData): Promise<any> {
        const response = await this.sendAndWaitForResponse<any>(
            'GET_PEOPLE_CHAT_MES',
            data
        );

        const rawData = response.data || [];
        const messages = Array.isArray(rawData)
            ? rawData
            : Object.values(rawData).filter(item => typeof item === 'object');
        return { messages };
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
