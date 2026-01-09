import React, {useState} from 'react';

interface CreateConversationModalProps {
    onClose: () => void;
    onCreateGroupChat: (groupName: string) => Promise<void>;
    onJoinGroupChat: (groupName: string) => Promise<void>;
    onStartChat: (username: string) => Promise<void>;
    userList: any[];
}

const NewConversationModal: React.FC<CreateConversationModalProps> = ({
                                                                          onClose,
                                                                          onCreateGroupChat,
                                                                          onJoinGroupChat,
                                                                          onStartChat,
                                                                          userList
                                                                      }) => {
    const [activeTab, setActiveTab] = useState<'create' | 'join' | 'people'>('people');
    const [groupName, setGroupName] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async () => {
        if (!groupName.trim() && activeTab !== 'people') {
            setError('Please enter a group name');
            return;
        }

        setLoading(true);
        setError('');

        try {
            if (activeTab === 'create') {
                await onCreateGroupChat(groupName);
            } else if (activeTab === 'join') {
                await onJoinGroupChat(groupName);
            }
            onClose();
        } catch (err: any) {
            setError(err.message || 'Operation failed');
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
            setLoading(false);
        }
    };

    // NEW: Handle direct username input
    const handleStartChatWithUsername = async () => {
        const username = searchQuery.trim();
        if (!username) {
            setError('Please enter a username');
            return;
        }
        await handleStartChat(username);
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

                {error && (
                    <div style={styles.modalError}>
                        <i className="fas fa-exclamation-circle"></i>
                        <span>{error}</span>
                        <button
                            onClick={() => setError('')}
                            style={styles.errorCloseBtn}
                        >
                            ×
                        </button>
                    </div>
                )}

                <div style={styles.tabs}>
                    <button
                        style={{
                            ...styles.tab,
                            ...(activeTab === 'people' ? styles.activeTab : {})
                        }}
                        onClick={() => setActiveTab('people')}
                    >
                        Direct Message
                    </button>
                    <button
                        style={{
                            ...styles.tab,
                            ...(activeTab === 'create' ? styles.activeTab : {})
                        }}
                        onClick={() => setActiveTab('create')}
                    >
                        Create Group
                    </button>
                    <button
                        style={{
                            ...styles.tab,
                            ...(activeTab === 'join' ? styles.activeTab : {})
                        }}
                        onClick={() => setActiveTab('join')}
                    >
                        Join Group
                    </button>
                </div>

                <div style={styles.content}>
                    {/* DIRECT MESSAGE TAB */}
                    {activeTab === 'people' && (
                        <div style={styles.formGroup}>
                            <label style={styles.label}>
                                Search or enter username
                            </label>

                            <div style={styles.searchContainer}>
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Type username..."
                                    style={styles.input}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            handleStartChatWithUsername();
                                        }
                                    }}
                                />
                                <button
                                    onClick={handleStartChatWithUsername}
                                    disabled={loading || !searchQuery.trim()}
                                    style={{
                                        ...styles.searchBtn,
                                        ...(loading || !searchQuery.trim() ? styles.searchBtnDisabled : {})
                                    }}
                                >
                                    {loading ? 'Checking...' : 'Start Chat'}
                                </button>
                            </div>

                            <div style={styles.divider}>
                                <span style={styles.dividerText}>or select from your list</span>
                            </div>

                            <div style={styles.userList}>
                                {filteredUsers.length === 0 ? (
                                    <div style={styles.emptyState}>
                                        {searchQuery ? 'No users found in your list' : 'No users available'}
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
                                                    }}/>
                                                    {user.isOnline ? 'Online' : 'Offline'}
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}

                    {/* CREATE/JOIN GROUP TABS */}
                    {(activeTab === 'create' || activeTab === 'join') && (
                        <div style={styles.formGroup}>
                            <label style={styles.label}>
                                {activeTab === 'create' ? 'Group Name' : 'Enter Group Name'}
                            </label>
                            <input
                                type="text"
                                value={groupName}
                                onChange={(e) => setGroupName(e.target.value)}
                                placeholder="Enter group name..."
                                style={styles.input}
                                disabled={loading}
                            />
                            <button
                                onClick={handleSubmit}
                                disabled={loading || !groupName.trim()}
                                style={{
                                    ...styles.submitBtn,
                                    ...(loading || !groupName.trim() ? styles.submitBtnDisabled : {})
                                }}
                            >
                                {loading ? 'Processing...' : activeTab === 'create' ? 'Create Group' : 'Join Room'}
                            </button>
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
    searchContainer: {
        display: 'flex',
        gap: '8px'
    },
    input: {
        flex: 1,
        padding: '12px 16px',
        border: '1px solid #ddd',
        borderRadius: '8px',
        fontSize: '14px',
        outline: 'none',
        transition: 'border-color 0.3s'
    },
    searchBtn: {
        padding: '12px 20px',
        backgroundColor: '#5d8e85',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        fontSize: '14px',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'background-color 0.3s',
        whiteSpace: 'nowrap'
    },
    searchBtnDisabled: {
        opacity: 0.5,
        cursor: 'not-allowed'
    },
    divider: {
        position: 'relative',
        textAlign: 'center',
        margin: '16px 0'
    },
    dividerText: {
        backgroundColor: 'white',
        padding: '0 10px',
        color: '#999',
        fontSize: '12px',
        position: 'relative',
        zIndex: 1
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
        maxHeight: '300px',
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
    },

    modalError: {
        backgroundColor: '#fee', // Giữ nguyên tên CamelCase của bạn
        border: '1px solid #fcc',
        borderRadius: '8px',
        padding: '12px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        color: '#c33',
        fontSize: '14px',
        margin: '16px 24px',
        animation: 'slideDown 0.3s ease'
    },
    modalErrorI: {
        fontSize: '16px'
    },
    errorCloseBtn: {
        marginLeft: 'auto',
        background: 'none',
        border: 'none',
        fontSize: '20px',
        cursor: 'pointer',
        color: '#c33',
        opacity: 0.7
    },
    chatErrorBanner: {
        backgroundColor: '#fff3cd',
        borderLeft: '4px solid #ffc107',
        padding: '12px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        color: '#856404',
        fontSize: '14px',
        animation: 'slideDown 0.3s ease'
    }
}

export default NewConversationModal;