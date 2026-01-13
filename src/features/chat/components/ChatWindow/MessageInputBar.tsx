import React, { useState, useRef } from "react";
import styles from "./ChatWindow.module.css";
import EmojiPicker from "../EmojiPicker/EmojiPicker";
import ImagePicker, { ImagePickerHandle } from "../ImagePicker/ImagePicker";
import UploadProgress from "../UploadProgress/UploadProgress";
import cloudinaryService from "../../../../services/api/cloudinaryService";

interface MessageInputBarProps {
    onSendMessage: (text: string) => void;
    disabled?: boolean;
}

interface UploadState {
    isUploading: boolean;
    progress: number;
    fileName: string;
}

const MessageInputBar: React.FC<MessageInputBarProps> = ({
                                                             onSendMessage,
                                                             disabled = false
                                                         }) => {
    const [text, setText] = useState('');
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const cursorPositionRef = useRef<number | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const [selectedImages, setSelectedImages] = useState<File[]>([]);
    const [uploadState, setUploadState] = useState<UploadState>({
        isUploading: false,
        progress: 0,
        fileName: ''
    });
    const imagePickerRef = useRef<ImagePickerHandle>(null);

    const handleImagesSelected = (files: File[]) => {
        setSelectedImages(files);
    };

    const handleInputSelect = (e: React.SyntheticEvent<HTMLInputElement>) => {
        cursorPositionRef.current = e.currentTarget.selectionStart;
    };

    const handleSend = async () => {
        if ((!text.trim() && selectedImages.length === 0) || disabled || uploadState.isUploading) {
            return;
        }

        try {
            let messageToSend = text.trim();

            // Logic upload image to Cloudinary
            if (selectedImages.length > 0) {
                setUploadState({
                    isUploading: true,
                    progress: 0,
                    fileName: selectedImages[0].name
                });

                const uploadResults = await cloudinaryService.uploadMultipleImages(
                    selectedImages,
                    (fileIndex, progress) => {
                        setUploadState(prev => ({
                            ...prev,
                            progress: Math.round((fileIndex * 100 + progress) / selectedImages.length),
                            fileName: selectedImages[fileIndex].name
                        }));
                    }
                );

                const imageUrls = uploadResults.map(result => result.secure_url);
                const imageMessage = imageUrls.map(url => `[IMAGE]${url}[/IMAGE]`).join('\n');

                if (messageToSend) {
                    messageToSend = `${messageToSend}\n${imageMessage}`;
                } else {
                    messageToSend = imageMessage;
                }
            }

            // Send message
            onSendMessage(messageToSend);

            // Reset state
            setText('');
            setSelectedImages([]);
            setShowEmojiPicker(false);
            cursorPositionRef.current = null;
            setUploadState({
                isUploading: false,
                progress: 0,
                fileName: ''
            });

            if (imagePickerRef.current) {
                imagePickerRef.current.clear();
            }
        } catch (error) {
            console.error('Error sending message with images:', error);
            alert('Có lỗi xảy ra khi tải ảnh lên. Vui lòng thử lại.');
            setUploadState({
                isUploading: false,
                progress: 0,
                fileName: ''
            });
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleEmojiSelect = (emoji: string) => {
        setText((prevText) => {
            const cursorPos = cursorPositionRef.current !== null 
                ? cursorPositionRef.current 
                : prevText.length;

            const before = prevText.substring(0, cursorPos);
            const after = prevText.substring(cursorPos);
            
            cursorPositionRef.current = cursorPos + emoji.length;

            return before + emoji + after;
        });

        setTimeout(() => {
            if (inputRef.current && cursorPositionRef.current !== null) {
                inputRef.current.focus();
                inputRef.current.setSelectionRange(cursorPositionRef.current, cursorPositionRef.current);
            }
        }, 0);
    };

    const isSendDisabled = disabled || uploadState.isUploading || (!text.trim() && selectedImages.length === 0);

    return (
        <>
            {/* {uploadState.isUploading && (
                <UploadProgress 
                    progress={uploadState.progress} 
                    fileName={uploadState.fileName}
                />
            )} */}

            <div className={styles.chatFooter}>
                <div className={styles.inputWrapper}>
                    <button
                        className={styles.iconBtn}
                        disabled={disabled}
                        title="Attach file"
                    >
                        <i className="fas fa-paperclip"></i>
                    </button>

                    <input
                        ref={inputRef}
                        type="text"
                        placeholder={disabled ? "Connecting..." : "Type your message here..."}
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        onSelect={handleInputSelect}
                        onKeyDown={handleKeyPress}
                        disabled={disabled || uploadState.isUploading}
                        className={styles.messageInput}
                    />

                    {/* Emoji picker */}
                    <div style={{ position: 'relative' }}>
                        <button
                            className={`${styles.iconBtn} ${showEmojiPicker ? styles.active : ''}`}
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                            disabled={disabled || uploadState.isUploading}
                        >
                            <i className="far fa-smile"></i>
                        </button>

                        {showEmojiPicker && (
                            <EmojiPicker
                                onEmojiSelect={handleEmojiSelect}
                                disabled={disabled}
                                onClose={() => setShowEmojiPicker(false)}
                            />
                        )}
                    </div>

                    <div className={styles.imagePickerWrapper}>
                        <ImagePicker
                            ref={imagePickerRef} 
                            onImagesSelected={handleImagesSelected}
                            maxImages={5}
                            disabled={disabled || uploadState.isUploading}
                        />
                    </div>
                </div>

                <button
                    className={`${styles.sendBtn} ${isSendDisabled ? styles.disabled : ''}`}
                    onClick={handleSend}
                    disabled={isSendDisabled}
                    title={text.trim() || selectedImages.length > 0 ? "Send message" : "Microphone"}
                >
                    <i className={`fas ${text.trim() || selectedImages.length > 0 ? 'fa-paper-plane' : 'fa-microphone'}`}></i>
                </button>
            </div>
        </>
    );
};

export default MessageInputBar;