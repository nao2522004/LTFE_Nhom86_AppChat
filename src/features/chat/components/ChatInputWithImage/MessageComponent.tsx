// src/components/Chat/MessageComponent.tsx
import React from 'react';
import ImageMessage from './ImageMessage';
import { parseMessage } from '../../../../shared/utils/messageParser';
import './MessageComponent.css';

interface Message {
  id: string;
  content: string;
  senderId: string;
  timestamp: string;
}

interface MessageComponentProps {
  message: Message;
  isOwnMessage: boolean;
}

const MessageComponent: React.FC<MessageComponentProps> = ({ message, isOwnMessage }) => {
  const parsedMessage = parseMessage(message.content);

  return (
    <div className={`message ${isOwnMessage ? 'message-own' : 'message-other'}`}>
      <div className="message-content">
        {parsedMessage.type === 'image' && parsedMessage.imageUrls && (
          <ImageMessage imageUrls={parsedMessage.imageUrls} />
        )}

        {parsedMessage.type === 'mixed' && parsedMessage.imageUrls && (
          <ImageMessage 
            imageUrls={parsedMessage.imageUrls} 
            caption={parsedMessage.text}
          />
        )}

        {parsedMessage.type === 'text' && (
          <div className="message-text">
            {parsedMessage.text}
          </div>
        )}

        <div className="message-timestamp">
          {new Date(message.timestamp).toLocaleTimeString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit'
          })}
        </div>
      </div>
    </div>
  );
};

export default MessageComponent;