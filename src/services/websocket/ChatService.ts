import { WebSocketConnection } from './WebSocketConnection';

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

export class ChatService {
    constructor(private connection: WebSocketConnection) {}

    // ===== GỬI TIN NHẮN =====
    async sendChat(data: SendChatData): Promise<void> {
        return this.connection.send({
            action: 'onchat',
            data: {
                event: 'SEND_CHAT',
                data
            }
        });
    }

    // ===== LẤY TIN NHẮN PHÒNG =====
    async getRoomMessages(data: GetMessagesData): Promise<any> {
        return this.sendAndWaitForResponse('GET_ROOM_CHAT_MES', data);
    }

    // ===== LẤY TIN NHẮN CÁ NHÂN =====
    async getPeopleMessages(data: GetMessagesData): Promise<any> {
        return this.sendAndWaitForResponse('GET_PEOPLE_CHAT_MES', data);
    }

    // ===== TẠO PHÒNG =====
    async createRoom(data: CreateRoomData): Promise<any> {
        return this.sendAndWaitForResponse('CREATE_ROOM', data);
    }

    // ===== THAM GIA PHÒNG =====
    async joinRoom(data: JoinRoomData): Promise<any> {
        return this.sendAndWaitForResponse('JOIN_ROOM', data);
    }

    // ===== LẮNG NGHE TIN NHẮN MỚI =====
    onChatReceived(callback: (message: any) => void) {
        this.connection.on('SEND_CHAT', callback);
    }

    offChatReceived(callback?: (message: any) => void) {
        this.connection.off('SEND_CHAT', callback);
    }

    private sendAndWaitForResponse(event: string, data: any, timeout = 10000): Promise<any> {
        return new Promise((resolve, reject) => {
            const timeoutId = setTimeout(() => {
                this.connection.off(event, handleResponse);
                reject(new Error(`${event} timeout`));
            }, timeout);

            const handleResponse = (response: any) => {
                clearTimeout(timeoutId);
                this.connection.off(event, handleResponse);

                if (response.status === 'success') {
                    resolve(response.data);
                } else {
                    reject(new Error(response.mes || `${event} failed`));
                }
            };

            this.connection.on(event, handleResponse);

            this.connection.send({
                action: 'onchat',
                data: {
                    event: event,
                    data: data
                }
            }).catch((err) => {
                clearTimeout(timeoutId);
                this.connection.off(event, handleResponse);
                reject(err);
            });
        });
    }
}
