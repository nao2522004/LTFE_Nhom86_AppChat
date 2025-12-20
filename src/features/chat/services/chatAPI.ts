import websocketService from '../../../services/websocket/MainService';

/**
 * DATA LAYER
 * Tập trung tất cả API calls ở đây
 * Không chứa Redux logic
 */
export const chatAPI = {
    // Gửi tin nhắn
    sendMessage: async (data: {
        type: 'room' | 'people';
        to: string;
        mes: string;
    }) => {
        return await websocketService.sendChat(data);
    },

    // Lấy tin nhắn phòng
    getRoomMessages: async (data: {
        roomName: string;
        page: number;
    }) => {
        return await websocketService.getRoomMessages(data);
    },

    // Lấy tin nhắn cá nhân
    getPeopleMessages: async (data: {
        userName: string;
        page: number;
    }) => {
        return await websocketService.getPeopleMessages(data);
    },

    // Tạo phòng
    createRoom: async (roomName: string) => {
        return await websocketService.createRoom({ name: roomName });
    },

    // Join phòng
    joinRoom: async (roomName: string) => {
        return await websocketService.joinRoom({ name: roomName });
    },

    // Lấy danh sách users
    getUserList: async () => {
        return await websocketService.getUserList();
    },

    // Check user
    checkUser: async (username: string) => {
        return await websocketService.checkUser({ user: username });
    }
};