import { WebSocketConnection } from './WebSocketConnection';

export interface CheckUserData {
    user: string;
}

export class UserService {
    constructor(private connection: WebSocketConnection) {}

    async checkUser(data: CheckUserData): Promise<any> {
        return this.sendAndWaitForResponse('CHECK_USER', data);
    }

    async getUserList(): Promise<any> {
        return this.sendAndWaitForResponse('GET_USER_LIST', {});
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