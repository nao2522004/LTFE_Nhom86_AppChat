export const formatMessageDate = (timestamp: string): string => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // Convert to VN timezone for comparison
    const vnDate = new Date(date.toLocaleString('en-US', { timeZone: 'Asia/Ho_Chi_Minh' }));
    const vnToday = new Date(today.toLocaleString('en-US', { timeZone: 'Asia/Ho_Chi_Minh' }));
    const vnYesterday = new Date(yesterday.toLocaleString('en-US', { timeZone: 'Asia/Ho_Chi_Minh' }));

    // Reset time parts for comparison
    const messageDate = new Date(vnDate.getFullYear(), vnDate.getMonth(), vnDate.getDate());
    const todayDate = new Date(vnToday.getFullYear(), vnToday.getMonth(), vnToday.getDate());
    const yesterdayDate = new Date(vnYesterday.getFullYear(), vnYesterday.getMonth(), vnYesterday.getDate());

    if (messageDate.getTime() === todayDate.getTime()) {
        return 'Hôm nay';
    } else if (messageDate.getTime() === yesterdayDate.getTime()) {
        return 'Hôm qua';
    } else {
        // Format: "10 Tháng 1, 2026"
        return vnDate.toLocaleDateString('vi-VN', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    }
};

export const isSameDay = (date1: string, date2: string): boolean => {
    const d1 = new Date(date1);
    const d2 = new Date(date2);

    // Convert to VN timezone
    const vn1 = new Date(d1.toLocaleString('en-US', { timeZone: 'Asia/Ho_Chi_Minh' }));
    const vn2 = new Date(d2.toLocaleString('en-US', { timeZone: 'Asia/Ho_Chi_Minh' }));

    return (
        vn1.getFullYear() === vn2.getFullYear() &&
        vn1.getMonth() === vn2.getMonth() &&
        vn1.getDate() === vn2.getDate()
    );
};

export interface GroupedMessage {
    type: 'date' | 'message';
    date?: string;
    message?: any;
}

export const groupMessagesByDate = (messages: any[]): GroupedMessage[] => {
    const grouped: GroupedMessage[] = [];

    messages.forEach((message, index) => {
        const isFirstMessage = index === 0;
        const prevMessage = messages[index - 1];

        // Add date separator if this is first message or different day
        if (isFirstMessage || !isSameDay(message.timestamp, prevMessage.timestamp)) {
            grouped.push({
                type: 'date',
                date: formatMessageDate(message.timestamp)
            });
        }

        // Add message
        grouped.push({
            type: 'message',
            message
        });
    });

    return grouped;
};