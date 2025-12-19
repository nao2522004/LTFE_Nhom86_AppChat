import { WebSocketConnection } from './WebSocketConnection';

export interface LoginData {
    user: string;
    pass: string;
}

export interface ReLoginData {
    user: string;
    code: string;
}

export interface RegisterData {
    user: string;
    pass: string;
}

export class AuthService {
    constructor(private connection: WebSocketConnection) {}

    async login(credentials: LoginData): Promise<any> {
        return this.sendAndWaitForResponse('LOGIN', credentials);
    }

    async reLogin(credentials: ReLoginData): Promise<any> {
        return this.sendAndWaitForResponse('RE_LOGIN', credentials);
    }

    async register(credentials: RegisterData): Promise<any> {
        return this.sendAndWaitForResponse('REGISTER', credentials);
    }

    async logout(): Promise<void> {
        await this.connection.send({
            action: 'onchat',
            data: {
                event: 'LOGOUT',
                data: {}
            }
        });
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