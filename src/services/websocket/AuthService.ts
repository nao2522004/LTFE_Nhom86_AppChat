import { BaseService } from './BaseService';
import { decryptToken, encryptToken } from '../../shared/utils/encryption';

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
        const response = await this.sendAndWaitForResponse<LoginResponse>("LOGIN", credentials);

        console.log('[AuthService.login] Server response:', response);

        if (response.RE_LOGIN_CODE) {
            try {
                const encryptedToken = await encryptToken(response.RE_LOGIN_CODE);

                localStorage.setItem("token", encryptedToken);
                localStorage.setItem("user", credentials.user);

                console.log("Token encrypted and saved");
            } catch (error) {
                console.error("Failed to encrypt token:", error);
                localStorage.setItem("token", response.RE_LOGIN_CODE);
                localStorage.setItem("user", credentials.user);
            }
        }
        return  response;
    }

    async reLogin(credentials: ReLoginData): Promise<any> {
        let decryptedCode = credentials.code;

        // decrypt token
        try {
            decryptedCode = await decryptToken(credentials.code);
            console.log("Token decrypted for relogin");
        } catch (error) {
            console.warn("Token decryption failed, using original token");
        }

        const response = await this.sendAndWaitForResponse<ReLoginResponse>("RE_LOGIN", {
            user: credentials.user,
            code: decryptedCode
        });

        // encrypt new token
        if (response.RE_LOGIN_CODE) {
            try {
                const encryptedToken = await encryptToken(response.RE_LOGIN_CODE);
                localStorage.setItem("token", encryptedToken);
                console.log("New token encrypted and saved");
            } catch (error) {
                console.error("Failed to encrypt new token:", error);
                localStorage.setItem("token", response.RE_LOGIN_CODE);
            }
        }

        return response;
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

        // remove token
        localStorage.removeItem("token");
        localStorage.removeItem("user");
    }
}