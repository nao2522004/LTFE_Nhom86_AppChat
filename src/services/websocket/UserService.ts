import {BaseService} from "./BaseService";

export class UserService extends BaseService {
    async checkUserExist(username: string): Promise<any> {
        const response = await this.sendAndWaitForResponse('CHECK_USER_EXIST', {
            user: username
        });
        return response.data;
    }

    async checkUserOnline(username: string): Promise<any> {
        const response = await this.sendAndWaitForResponse('CHECK_USER_ONLINE', {
            user: username
        });
        return response.data;
    }

    async getUserList(): Promise<any> {
        const response = await this.sendAndWaitForResponse<any>(
            'GET_USER_LIST',
            {}
        );

        const rawData = response.data || [];
        const dataArray = Array.isArray(rawData)
            ? rawData
            : Object.values(rawData).filter(item => typeof item === 'object');

        const users = dataArray
            .filter((item: any) => item.type === 0)
            .map((item: any) => ({
                id: item.name,
                username: item.name,
                displayName: item.name,
                name: item.name,
                avatar: null,
                isOnline: true,
                lastSeen: item.actionTime,
                type: 'people'
            }));

        const conversations = dataArray
            .filter((item: any) => item.type === 1)
            .map((item: any) => ({
                id: item.name,
                name: item.name,
                type: 'room' as const,
                participants: [],
                unreadCount: 0,
                createdAt: item.actionTime,
                updatedAt: item.actionTime
            }));

        return { users, conversations };
    }
}