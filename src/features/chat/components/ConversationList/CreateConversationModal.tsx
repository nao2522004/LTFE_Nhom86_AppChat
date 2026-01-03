import React, { useState } from 'react';

interface CreateConversationModalProps {
    onClose: () => void;
    onCreateRoom: (roomName: string) => Promise<void>;
    onJoinRoom: (roomName: string) => Promise<void>;
    onStartChat: (username: string) => Promise<void>;
    userList: any[];
}

const CreateConversationModal: React.FC<CreateConversationModalProps> = ({
                                                                             onClose,
                                                                             onCreateRoom,
                                                                             onJoinRoom,
                                                                             onStartChat,
                                                                             userList
                                                                         }) => {
    const [activeTab, setActiveTab] = useState<'create' | 'join' | 'people'>('create');
    const [roomName, setRoomName] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async () => {
        if (!roomName.trim() && activeTab !== 'people') {
            setError('Please enter a room name');
            return;
        }

        setLoading(true);
        setError('');

        try {
            if (activeTab === 'create') {
                await onCreateRoom(roomName);
            } else if (activeTab === 'join') {
                await onJoinRoom(roomName);
            }
            onClose();
        } catch (err: any) {
            setError(err.message || 'Operation failed');
        } finally {
            setLoading(false);
        }
    };

    const handleStartChat = async (username: string) => {
        setLoading(true);
        setError('');
        try {
            await onStartChat(username);
            onClose();
        } catch (err: any) {
            setError(err.message || 'Failed to start chat');
        } finally {
            setLoading(false);
        }
    };

    const filteredUsers = userList.filter(user =>
        user.username?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div style={styles.overlay} onClick={onClose}>
            <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
                <div style={styles.header}>
                    <h2 style={styles.title}>New Conversation</h2>
                    <button style={styles.closeBtn} onClick={onClose}>×</button>
                </div>

                <div style={styles.tabs}>
                    <button
                        style={{
                            ...styles.tab,
                            ...(activeTab === 'create' ? styles.activeTab : {})
                        }}
                        onClick={() => setActiveTab('create')}
                    >
                        Create Room
                    </button>
                    <button
                        style={{
                            ...styles.tab,
                            ...(activeTab === 'join' ? styles.activeTab : {})
                        }}
                        onClick={() => setActiveTab('join')}
                    >
                        Join Room
                    </button>
                    <button
                        style={{
                            ...styles.tab,
                            ...(activeTab === 'people' ? styles.activeTab : {})
                        }}
                        onClick={() => setActiveTab('people')}
                    >
                        Direct Message
                    </button>
                </div>

                <div style={styles.content}>
                    {error && (
                        <div style={styles.error}>
                            {error}
                        </div>
                    )}

                    {(activeTab === 'create' || activeTab === 'join') && (
                        <div style={styles.formGroup}>
                            <label style={styles.label}>
                                {activeTab === 'create' ? 'Room Name' : 'Enter Room Name'}
                            </label>
                            <input
                                type="text"
                                value={roomName}
                                onChange={(e) => setRoomName(e.target.value)}
                                placeholder="Enter room name..."
                                style={styles.input}
                                disabled={loading}
                            />
                            <button
                                onClick={handleSubmit}
                                disabled={loading || !roomName.trim()}
                                style={{
                                    ...styles.submitBtn,
                                    ...(loading || !roomName.trim() ? styles.submitBtnDisabled : {})
                                }}
                            >
                                {loading ? 'Processing...' : activeTab === 'create' ? 'Create Room' : 'Join Room'}
                            </button>
                        </div>
                    )}

                    {activeTab === 'people' && (
                        <div style={styles.formGroup}>
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search users..."
                                style={styles.input}
                            />

                            <div style={styles.userList}>
                                {filteredUsers.length === 0 ? (
                                    <div style={styles.emptyState}>
                                        {searchQuery ? 'No users found' : 'No users available'}
                                    </div>
                                ) : (
                                    filteredUsers.map((user: any) => (
                                        <div
                                            key={user.id || user.username}
                                            style={styles.userItem}
                                            onClick={() => handleStartChat(user.username)}
                                        >
                                            <img
                                                src={user.avatar || `https://i.pravatar.cc/150?img=${user.id || 3}`}
                                                alt={user.username}
                                                style={styles.avatar}
                                            />
                                            <div style={styles.userInfo}>
                                                <div style={styles.userName}>
                                                    {user.displayName || user.username}
                                                </div>
                                                <div style={styles.userStatus}>
                          <span style={{
                              ...styles.statusDot,
                              backgroundColor: user.isOnline ? '#28a745' : '#999'
                          }} />
                                                    {user.isOnline ? 'Online' : 'Offline'}
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const styles: { [key: string]: React.CSSProperties } = {
    overlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000
    },
    modal: {
        backgroundColor: 'white',
        borderRadius: '16px',
        width: '90%',
        maxWidth: '500px',
        maxHeight: '80vh',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 10px 40px rgba(0,0,0,0.2)'
    },
    header: {
        padding: '20px 24px',
        borderBottom: '1px solid #eee',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    title: {
        margin: 0,
        fontSize: '20px',
        fontWeight: '600',
        color: '#333'
    },
    closeBtn: {
        background: 'none',
        border: 'none',
        fontSize: '32px',
        color: '#999',
        cursor: 'pointer',
        padding: '0',
        width: '32px',
        height: '32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        lineHeight: '1'
    },
    tabs: {
        display: 'flex',
        borderBottom: '1px solid #eee',
        padding: '0 24px'
    },
    tab: {
        flex: 1,
        padding: '16px',
        background: 'none',
        border: 'none',
        borderBottom: '2px solid transparent',
        fontSize: '14px',
        fontWeight: '500',
        color: '#666',
        cursor: 'pointer',
        transition: 'all 0.3s'
    },
    activeTab: {
        color: '#5d8e85',
        borderBottomColor: '#5d8e85'
    },
    content: {
        padding: '24px',
        flex: 1,
        overflowY: 'auto'
    },
    error: {
        padding: '12px',
        backgroundColor: '#fee',
        border: '1px solid #fcc',
        borderRadius: '8px',
        color: '#c33',
        fontSize: '14px',
        marginBottom: '16px'
    },
    formGroup: {
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
    },
    label: {
        fontSize: '14px',
        fontWeight: '500',
        color: '#333',
        marginBottom: '8px'
    },
    input: {
        padding: '12px 16px',
        border: '1px solid #ddd',
        borderRadius: '8px',
        fontSize: '14px',
        outline: 'none',
        transition: 'border-color 0.3s'
    },
    submitBtn: {
        padding: '12px',
        backgroundColor: '#5d8e85',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        fontSize: '14px',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'background-color 0.3s'
    },
    submitBtnDisabled: {
        opacity: 0.5,
        cursor: 'not-allowed'
    },
    userList: {
        maxHeight: '400px',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px'
    },
    userItem: {
        display: 'flex',
        alignItems: 'center',
        padding: '12px',
        borderRadius: '8px',
        cursor: 'pointer',
        transition: 'background-color 0.2s',
        border: '1px solid #eee'
    },
    avatar: {
        width: '48px',
        height: '48px',
        borderRadius: '50%',
        marginRight: '12px',
        objectFit: 'cover'
    },
    userInfo: {
        flex: 1
    },
    userName: {
        fontSize: '15px',
        fontWeight: '500',
        color: '#333',
        marginBottom: '4px'
    },
    userStatus: {
        fontSize: '13px',
        color: '#666',
        display: 'flex',
        alignItems: 'center',
        gap: '6px'
    },
    statusDot: {
        width: '8px',
        height: '8px',
        borderRadius: '50%'
    },
    emptyState: {
        padding: '40px',
        textAlign: 'center',
        color: '#999',
        fontSize: '14px'
    }
};

export default CreateConversationModal;