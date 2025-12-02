import React from 'react';
import styles from './UserSettings.module.css';
import { UserSettings as IUserSettings } from '../../../types/user';

interface UserSettingsProps {
    settings: IUserSettings;
    onUpdateSettings: (settings: Partial<IUserSettings>) => void;
}

const UserSettings: React.FC<UserSettingsProps> = ({ settings, onUpdateSettings }) => {
    const handleToggle = (key: keyof IUserSettings) => {
        onUpdateSettings({ [key]: !settings[key] });
    };

    const handleThemeChange = (theme: 'light' | 'dark') => {
        onUpdateSettings({ theme });
    };

    return (
        <div className={styles.settingsContainer}>
            <h2 className={styles.title}>Cài đặt</h2>
            
            <div className={styles.settingItem}>
                <label className={styles.settingLabel}>
                    <span>Thông báo</span>
                    <input
                        type="checkbox"
                        checked={settings.notifications}
                        onChange={() => handleToggle('notifications')}
                        className={styles.checkbox}
                    />
                </label>
            </div>

            <div className={styles.settingItem}>
                <label className={styles.settingLabel}>
                    <span>Âm thanh</span>
                    <input
                        type="checkbox"
                        checked={settings.soundEnabled}
                        onChange={() => handleToggle('soundEnabled')}
                        className={styles.checkbox}
                    />
                </label>
            </div>

            <div className={styles.settingItem}>
                <span className={styles.settingLabel}>Giao diện</span>
                <div className={styles.themeButtons}>
                    <button
                        className={`${styles.themeButton} ${settings.theme === 'light' ? styles.active : ''}`}
                        onClick={() => handleThemeChange('light')}
                    >
                        Sáng
                    </button>
                    <button
                        className={`${styles.themeButton} ${settings.theme === 'dark' ? styles.active : ''}`}
                        onClick={() => handleThemeChange('dark')}
                    >
                        Tối
                    </button>
                </div>
            </div>
        </div>
    );
};

export default UserSettings;