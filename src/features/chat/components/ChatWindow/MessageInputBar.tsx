import React, { useState, useRef } from "react";
import styles from "./ChatWindow.module.css";
import EmojiPicker from "../EmojiPicker/EmojiPicker";
import MediaPicker, { MediaPickerHandle } from "../MediaPicker/MediaPicker";
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
    const [selectedMedia, setSelectedMedia] = useState<File[]>([]);
    const [uploadState, setUploadState] = useState<UploadState>({
        isUploading: false,
        progress: 0,
        fileName: ''
    });
    const mediaPickerRef = useRef<MediaPickerHandle>(null);

    const handleMediaSelected = (files: File[]) => {
        setSelectedMedia(files);
    };

    const handleSend = async () => {
        if ((!plainText.trim() && selectedMedia.length === 0) || disabled || uploadState.isUploading) {
            return;
        }

        try {
            let messageToSend = htmlContent.trim();

            if (selectedMedia.length > 0) {
                setUploadState({
                    isUploading: true,
                    progress: 0,
                    fileName: selectedMedia[0].name
                });

                const imageFiles = selectedMedia.filter(f => f.type.startsWith('image/'));
                const videoFiles = selectedMedia.filter(f => f.type.startsWith('video/'));

                let allMediaUrls: string[] = [];

                // Upload images
                if (imageFiles.length > 0) {
                    const imageResults = await cloudinaryService.uploadMultipleImages(
                        imageFiles,
                        (fileIndex, progress) => {
                            const totalFiles = selectedMedia.length;
                            const overallProgress = Math.round(
                                ((fileIndex + imageFiles.length) * 100 + progress) / totalFiles
                            );
                            setUploadState(prev => ({
                                ...prev,
                                progress: overallProgress,
                                fileName: imageFiles[fileIndex].name
                            }));
                        }
                    );
                    const imageUrls = imageResults.map(r => r.secure_url);
                    const imageMessage = imageUrls.map(url => `[IMAGE]${url}[/IMAGE]`).join('\n');
                    allMediaUrls.push(imageMessage);
                }

                // Upload videos
                if (videoFiles.length > 0) {
                    const videoResults = await cloudinaryService.uploadMultipleVideos(
                        videoFiles,
                        (fileIndex, progress) => {
                            const totalFiles = selectedMedia.length;
                            const offset = imageFiles.length;
                            const overallProgress = Math.round(
                                ((offset + fileIndex) * 100 + progress) / totalFiles
                            );
                            setUploadState(prev => ({
                                ...prev,
                                progress: overallProgress,
                                fileName: videoFiles[fileIndex].name
                            }));
                        }
                    );
                    const videoUrls = videoResults.map(r => r.secure_url);
                    const videoMessage = videoUrls.map(url => `[VIDEO]${url}[/VIDEO]`).join('\n');
                    allMediaUrls.push(videoMessage);
                }

                const combinedMedia = allMediaUrls.join('\n');

                if (messageToSend) {
                    messageToSend = `${messageToSend}\n${combinedMedia}`;
                } else {
                    messageToSend = combinedMedia;
                }
            }

            onSendMessage(messageToSend);

            setHtmlContent('');
            setPlainText('');
            setSelectedMedia([]);
            setShowEmojiPicker(false);
            setUploadState({
                isUploading: false,
                progress: 0,
                fileName: ''
            });

            if (mediaPickerRef.current) {
                mediaPickerRef.current.clear();
            }
        } catch (error) {
            console.error('Error sending message:', error);
            alert('Có lỗi xảy ra khi tải file. Vui lòng thử lại.');
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

    const isSendDisabled = disabled || uploadState.isUploading || (!plainText.trim() && selectedMedia.length === 0);

    return (
        <>
            {uploadState.isUploading && (
                <UploadProgress 
                    progress={uploadState.progress} 
                    fileName={uploadState.fileName}
                />
            )}

            <div className={styles.chatFooter}>
                <div className={styles.inputWrapper}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%' }}>
                        <button
                            className={styles.iconBtn}
                            disabled={disabled}
                            title="Attach file"
                        >
                            <i className="fas fa-paperclip"></i>
                        </button>

                        <RichTextEditor
                            value={htmlContent}
                            onChange={handleEditorChange}
                            onKeyDown={handleKeyPress}
                            placeholder={disabled ? "Connecting..." : "Type your message here..."}
                            disabled={disabled || uploadState.isUploading}
                        />

                        <div style={{ position: 'relative' }}>
                            <button
                                className={`${styles.iconBtn} ${showEmojiPicker ? styles.active : ''}`}
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                                disabled={disabled || uploadState.isUploading}
                                title="Emoji"
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

                        <div className={styles.mediaPickerWrapper}>
                            <MediaPicker
                                ref={mediaPickerRef}
                                onMediaSelected={handleMediaSelected}
                                maxFiles={5}
                                disabled={disabled || uploadState.isUploading}
                            />
                        </div>
                    </div>
                </div>

                <button
                    className={`${styles.sendBtn} ${isSendDisabled ? styles.disabled : ''}`}
                    onClick={handleSend}
                    disabled={isSendDisabled}
                    title={plainText.trim() || selectedMedia.length > 0 ? "Send message" : "Microphone"}
                >
                    <i className={`fas ${plainText.trim() || selectedMedia.length > 0 ? 'fa-paper-plane' : 'fa-microphone'}`}></i>
                </button>
            </div>
        </>
    );
};

export default MessageInputBar;