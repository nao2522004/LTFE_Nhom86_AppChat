import React, { useState, useRef } from "react";
import styles from "./ChatWindow.module.css";
import EmojiPicker from "../EmojiPicker/EmojiPicker";
import ImagePicker, { ImagePickerHandle } from "../ImagePicker/ImagePicker";
import UploadProgress from "../UploadProgress/UploadProgress";
import cloudinaryService from "../../../../services/api/cloudinaryService";
import RichTextEditor from "../RichTextEditor/RichTextEditor";  


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
    const [htmlContent, setHtmlContent] = useState('');  
    const [plainText, setPlainText] = useState('');                                                            
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

    // const handleInputSelect = (e: React.SyntheticEvent<HTMLInputElement>) => {
    //     cursorPositionRef.current = e.currentTarget.selectionStart;
    // };

    const handleSend = async () => {
        if ((!plainText.trim() && selectedImages.length === 0) || disabled || uploadState.isUploading) {
            return;
        }

        try {
            let messageToSend = htmlContent.trim();

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
            // setText('');
            setHtmlContent('');      
            setPlainText('');        
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
        document.execCommand('insertText', false, emoji);
        setShowEmojiPicker(false);
    };

     const handleEditorChange = (html: string, text: string) => {  
        setHtmlContent(html);
        setPlainText(text);
    };

    const isSendDisabled = disabled || uploadState.isUploading || (!plainText.trim() && selectedImages.length === 0);

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

                    {/* <input
                        ref={inputRef}
                        type="text"
                        placeholder={disabled ? "Connecting..." : "Type your message here..."}
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        onSelect={handleInputSelect}
                        onKeyDown={handleKeyPress}
                        disabled={disabled || uploadState.isUploading}
                        className={styles.messageInput}
                    /> */}

                    <RichTextEditor
                        value={htmlContent}
                        onChange={handleEditorChange}
                        onKeyDown={handleKeyPress}
                        placeholder={disabled ? "Connecting..." : "Type your message here..."}
                        disabled={disabled || uploadState.isUploading}
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
                    title={plainText.trim() || selectedImages.length > 0 ? "Send message" : "Microphone"}
                >
                    <i className={`fas ${plainText.trim() || selectedImages.length > 0 ? 'fa-paper-plane' : 'fa-microphone'}`}></i>
                </button>
            </div>
        </>
    );
};

export default MessageInputBar;