import React, { useState, useRef, useEffect } from 'react';
import EmojiPickerReact, { EmojiClickData, Theme } from 'emoji-picker-react';
import styles from './EmojiPicker.module.css';

interface EmojiPickerProps {
    onEmojiSelect: (emoji: string) => void;
    disabled?: boolean;
    onClose?: () => void;
}

const EmojiPicker: React.FC<EmojiPickerProps> = ({ 
    onEmojiSelect, 
    disabled = false,
    onClose
}) => {
    const pickerRef = useRef<HTMLDivElement>(null);

    const handleEmojiClick = (emojiData: EmojiClickData) => {
        if (!disabled) {
            onEmojiSelect(emojiData.emoji);
        }
    };

    if (disabled) return null;

    return (
        <div className={styles.emojiPickerContainer} ref={pickerRef}>
            <EmojiPickerReact 
                onEmojiClick={handleEmojiClick}
                autoFocusSearch={false}
                theme={Theme.LIGHT}
                searchPlaceHolder="Tìm kiếm emoji..."
                width={300}
                height={400}
                previewConfig={{ showPreview: false }}
            />
        </div>
    );
};

export default EmojiPicker;