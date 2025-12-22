import { BaseService } from './BaseService';

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

interface LoginResponse {
    user: any;
    token: string;
    RE_LOGIN_CODE: string;
}

interface ReLoginResponse {
    RE_LOGIN_CODE: string;
}

export class AuthService extends BaseService{
    async login(credentials: LoginData): Promise<any> {
        return  this.sendAndWaitForResponse<LoginResponse>('LOGIN', credentials);
    }

    async reLogin(credentials: ReLoginData): Promise<any> {
        return this.sendAndWaitForResponse<ReLoginResponse>('RE_LOGIN', credentials);
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
}