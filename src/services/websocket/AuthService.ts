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
    data: {
        RE_LOGIN_CODE: string
    },
    event: String,
    status: String
}

interface ReLoginResponse {
    data: {
        RE_LOGIN_CODE: string
    },
    event: String,
    status: String
}

export class AuthService extends BaseService{
    async login(credentials: LoginData): Promise<any> {
        const response = await this.sendAndWaitForResponse<LoginResponse>("LOGIN", credentials, 120000);

        const token = response.data?.RE_LOGIN_CODE;

        if (token) {
            try {
                const encryptedToken = await encryptToken(token);
                const encryptedUser = await encryptToken(credentials.user);

                localStorage.setItem("token", encryptedToken);
                localStorage.setItem("user", encryptedUser);

                console.log("Token encrypted and saved");
            } catch (error) {
                console.error("Failed to encrypt token:", error);
                localStorage.setItem("token", token);
                localStorage.setItem("user", credentials.user);
            }
        }
        return  response;
    }

    async reLogin(credentials: ReLoginData): Promise<any> {
        let decryptedCode = credentials.code;
        let decryptedUser = credentials.user;

        // decrypt token
        try {
            decryptedCode = await decryptToken(credentials.code);
            decryptedUser = await decryptToken(credentials.user);
            console.log("Token decrypted for relogin");
        } catch (error) {
            console.warn("Token decryption failed, using original token");
        }

        const response = await this.sendAndWaitForResponse<ReLoginResponse>("RE_LOGIN", {
            user: decryptedUser,
            code: decryptedCode
        }, 120000);

        // encrypt new token
        const token = response.data?.RE_LOGIN_CODE;
        if (token) {
            try {
                const encryptedToken = await encryptToken(token);
                localStorage.setItem("token", encryptedToken);
                console.log("New token encrypted and saved");
            } catch (error) {
                console.error("Failed to encrypt new token:", error);
                localStorage.setItem("token", token);
            }
        }

        return response;
    }

    async register(credentials: RegisterData): Promise<any> {
        return this.sendAndWaitForResponse('REGISTER', credentials, 120000);
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
        localStorage.removeItem("epr_suggested");
    }
}