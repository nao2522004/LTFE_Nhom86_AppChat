import {BaseService} from "./BaseService";

export interface CheckUserData {
    user: string;
}

interface UserListResponse {
    users: any[];
}

export class UserService extends BaseService {
    async checkUser(data: CheckUserData): Promise<any> {
        return this.sendAndWaitForResponse('CHECK_USER', data);
    }

    async getUserList(): Promise<any> {
        const response = await this.sendAndWaitForResponse<UserListResponse>('GET_USER_LIST', {});

        const rawData = response.users || response || [];

        const users = rawData
            .filter((item: any) => item.type === 0) // type: 0 = user
            .map((item: any, index: number) => ({
                id: item.name,
                username: item.name,
                displayName: item.name,
                name: item.name,
                avatar: null,
                isOnline: true,
                lastSeen: item.actionTime,
                type: 'user'
            }));

        const rooms = rawData
            .filter((item: any) => item.type === 1) // type: 1 = group/room
            .map((item: any, index: number) => ({
                id: item.name,
                name: item.name,
                type: 'group' as const,
                participants: [],
                unreadCount: 0,
                createdAt: item.actionTime,
                updatedAt: item.actionTime
            }));

        return { users, rooms };
    }
}