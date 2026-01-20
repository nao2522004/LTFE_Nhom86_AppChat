import React, { useState } from 'react';
import { Send } from 'lucide-react';
import MediaPicker from '../MediaPicker/MediaPicker';
import UploadProgress from '../UploadProgress/UploadProgress';
import cloudinaryService from '../../../../services/api/cloudinaryService';
import './ChatInput.css';

interface ChatInputWithImageProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
}

interface UploadState {
  isUploading: boolean;
  progress: number;
  fileName: string;
}

const ChatInputWithImage: React.FC<ChatInputWithImageProps> = ({ 
  onSendMessage, 
  disabled = false 
}) => {
  const [message, setMessage] = useState('');
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [uploadState, setUploadState] = useState<UploadState>({
    isUploading: false,
    progress: 0,
    fileName: ''
  });

  const handleImagesSelected = (files: File[]) => {
    setSelectedImages(files);
  };

  const handleSendMessage = async () => {
    if (!message.trim() && selectedImages.length === 0) return;
    if (disabled || uploadState.isUploading) return;

    try {
      let messageToSend = message.trim();

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

      onSendMessage(messageToSend);

      // Reset state
      setMessage('');
      setSelectedImages([]);
      setUploadState({
        isUploading: false,
        progress: 0,
        fileName: ''
      });
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
      handleSendMessage();
    }
  };

  return (
    <>
      {uploadState.isUploading && (
        <UploadProgress 
          progress={uploadState.progress} 
          fileName={uploadState.fileName}
        />
      )}

      <div className="chat-input-container">
        <MediaPicker
          onMediaSelected={handleImagesSelected}
          maxFiles={5}
          disabled={disabled || uploadState.isUploading}
        />

        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={selectedImages.length > 0 
            ? `${selectedImages.length} ảnh đã chọn. Nhập mô tả (tùy chọn)...` 
            : "Nhập tin nhắn..."
          }
          disabled={disabled || uploadState.isUploading}
          className="chat-input"
          rows={1}
        />

        <button
          onClick={handleSendMessage}
          disabled={disabled || uploadState.isUploading || (!message.trim() && selectedImages.length === 0)}
          className="send-button"
        >
          <Send size={20} />
        </button>
      </div>
    </>
  );
};

export default ChatInputWithImage;