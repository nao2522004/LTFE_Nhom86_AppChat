import {BaseService} from "./BaseService";

export interface CheckUserData {
    user: string;
}

interface UserListResponse {
    users: any[];
}

export class UserService extends BaseService{
    async checkUser(data: CheckUserData): Promise<any> {
        return this.sendAndWaitForResponse('CHECK_USER', data);
    }

    async getUserList(): Promise<any> {
        return this.sendAndWaitForResponse<UserListResponse>('GET_USER_LIST', {});
    }
}