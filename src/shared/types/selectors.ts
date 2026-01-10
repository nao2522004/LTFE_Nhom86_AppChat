// src/shared/selectors.ts
import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '../../app/store';

/**
 * COMBINED SELECTORS - Cross-slice data queries
 * Uses memoization to prevent unnecessary re-renders
 */

// ===== CURRENT USER =====
export const selectCurrentUser = createSelector(
    [
        (state: RootState) => state.auth.user,
        (state: RootState) => state.chat.users.byId
    ],
    (authUser, usersById) => {
        if (!authUser) return null;
        // Return auth user if exists, or try to get from chat users
        return authUser || null;
    }
);

// ===== ACTIVE CONVERSATION =====
export const selectActiveConversation = createSelector(
    [
        (state: RootState) => state.ui.activeConversationId,
        (state: RootState) => state.chat.conversations.byId,
        (state: RootState) => state.chat.users.byId,
    ],
    (activeId, conversationsById, usersById) => {
        if (!activeId) return null;

        // Check if it's a conversation
        const conversation = conversationsById[activeId];
        if (conversation) return conversation;

        // Check if it's a user (people chat)
        const user = usersById[activeId];
        if (user) {
            // Convert user to conversation format
            return {
                id: user.username,
                name: user.displayName || user.username,
                type: 'people' as const,
                participants: [user.username],
                unreadCount: 0,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
            };
        }

        return null;
    }
);

// ===== ACTIVE CONVERSATION MESSAGES =====
export const selectActiveConversationMessages = createSelector(
    [
        (state: RootState) => state.ui.activeConversationId,
        (state: RootState) => state.chat.messages.allIds,
        (state: RootState) => state.chat.messages.byId,
    ],
    (activeId, allIds, messagesById) => {
        if (!activeId) return [];

        return allIds
            .map(id => messagesById[id])
            .filter(msg => {
                const receiverId = msg.receiver.id || msg.receiver.name;
                const senderId = msg.sender.id || msg.sender.username;
                return receiverId === activeId || senderId === activeId;
            })
            .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    }
);

// ===== CONVERSATIONS WITH DETAILS =====
export const selectConversationsWithDetails = createSelector(
    [
        (state: RootState) => state.chat.conversations.allIds,
        (state: RootState) => state.chat.conversations.byId,
        (state: RootState) => state.chat.messages.byId,
    ],
    (allIds, conversationsById, messagesById) => {
        return allIds.map(id => {
            const conv = conversationsById[id];
            const lastMessage = conv.lastMessage ? messagesById[conv.lastMessage.id] : undefined;
            return { ...conv, lastMessage };
        });
    }
);

// ===== USERS WITH STATUS =====
export const selectUsersWithStatus = createSelector(
    [
        (state: RootState) => state.chat.users.allIds,
        (state: RootState) => state.chat.users.byId,
    ],
    (allIds, usersById) => {
        return allIds
            .map(id => usersById[id])
            .sort((a, b) => {
                // Sort by online status first
                if (a.isOnline && !b.isOnline) return -1;
                if (!a.isOnline && b.isOnline) return 1;
                // Then by username
                return a.username.localeCompare(b.username);
            });
    }
);

// ===== TOTAL UNREAD COUNT =====
export const selectTotalUnreadCount = createSelector(
    [
        (state: RootState) => state.chat.conversations.allIds,
        (state: RootState) => state.chat.conversations.byId,
    ],
    (allIds, conversationsById) => {
        return allIds.reduce((total, id) => {
            return total + (conversationsById[id]?.unreadCount || 0);
        }, 0);
    }
);

// ===== SEARCH RESULTS =====
export const selectSearchResults = (searchQuery: string) =>
    createSelector(
        [
            (state: RootState) => state.chat.conversations.allIds,
            (state: RootState) => state.chat.conversations.byId,
            (state: RootState) => state.chat.users.allIds,
            (state: RootState) => state.chat.users.byId,
        ],
        (convIds, conversationsById, userIds, usersById) => {
            const query = searchQuery.toLowerCase();

            const conversations = convIds
                .map(id => conversationsById[id])
                .filter(conv => conv.name.toLowerCase().includes(query));

            const users = userIds
                .map(id => usersById[id])
                .filter(
                    user =>
                        user.username.toLowerCase().includes(query) ||
                        user.displayName?.toLowerCase().includes(query)
                );

            return { conversations, users };
        }
    );

// ===== LOADING STATES =====
export const selectIsAnyLoading = createSelector(
    [
        (state: RootState) => state.ui.loading.messages,
        (state: RootState) => state.ui.loading.conversations,
        (state: RootState) => state.ui.loading.users,
        (state: RootState) => state.auth.loading,
    ],
    (messagesLoading, conversationsLoading, usersLoading, authLoading) => {
        return messagesLoading || conversationsLoading || usersLoading || authLoading;
    }
);