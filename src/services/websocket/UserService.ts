import {BaseService} from "./BaseService";

interface UserListResponse {
    users: any[];
}

export interface CheckUserOnlineData {
    user: string;
}

interface UserListResponse {
    users: any[];
}


export class UserService extends BaseService {
    async checkUserExist(username: string): Promise<any> {
        return this.sendAndWaitForResponse('CHECK_USER_EXIST', {
            user: username
        });
    }

    async checkUserOnline(username: string): Promise<any> {
        return this.sendAndWaitForResponse('CHECK_USER_ONLINE', {
            user: username
        });
    }

    async getUserList(): Promise<any> {
        const response = await this.sendAndWaitForResponse<UserListResponse>(
            'GET_USER_LIST',
            {}
        );

        const rawData = response.users || response || [];

        const users = rawData
            .filter((item: any) => item.type === 0)
            .map((item: any) => ({
                id: item.name,
                username: item.name,
                displayName: item.name,
                name: item.name,
                avatar: null,
                isOnline: true,
                lastSeen: item.actionTime,
                type: 'user'
            }));

        const conversations = rawData
            .filter((item: any) => item.type === 1)
            .map((item: any) => ({
                id: item.name,
                name: item.name,
                type: 'group' as const,
                participants: [],
                unreadCount: 0,
                createdAt: item.actionTime,
                updatedAt: item.actionTime
            }));

        return { users, conversations };
    }
}