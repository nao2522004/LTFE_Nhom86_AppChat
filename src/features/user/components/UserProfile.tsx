import React from 'react';
import styles from './UserProfile.module.css';
import { User } from '../../../shared/types/user';

interface UserProfileProps {
    user: User;
    isEditable?: boolean;
    onEdit?: () => void;
}

const UserProfile: React.FC<UserProfileProps> = ({ user, isEditable = false, onEdit }) => {
    return (
        <div className={styles.profileContainer}>
            <div className={styles.avatarSection}>
                <img 
                    src={user.avatar || '/default-avatar.png'} 
                    alt={user.displayName || user.username}
                    className={styles.avatar}
                />
                {user.isOnline && <span className={styles.onlineIndicator} />}
            </div>
            
            <div className={styles.infoSection}>
                <h2 className={styles.displayName}>
                    {user.displayName || user.username}
                </h2>
                <p className={styles.username}>@{user.username}</p>
                <p className={styles.email}>{user.email}</p>
                
                {user.bio && (
                    <div className={styles.bioSection}>
                        <p className={styles.bio}>{user.bio}</p>
                    </div>
                )}
                
                {isEditable && (
                    <button className={styles.editButton} onClick={onEdit}>
                        Chỉnh sửa hồ sơ
                    </button>
                )}
            </div>
        </div>
    );
};

export default UserProfile;