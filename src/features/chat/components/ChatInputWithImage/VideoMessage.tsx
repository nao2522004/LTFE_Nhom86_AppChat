import React from 'react';
import styles from './VideoMessage.module.css';

interface VideoMessageProps {
  videoUrls: string[];
}

const VideoMessage: React.FC<VideoMessageProps> = ({ videoUrls }) => {
  return (
    <div className={styles.videoMessage}>
      {videoUrls.map((url, index) => (
        <div key={index} className={styles.videoContainer}>
          <video 
            controls 
            className={styles.video}
            preload="metadata"
          >
            <source src={url} type="video/mp4" />
            Trình duyệt không hỗ trợ video.
          </video>
        </div>
      ))}
    </div>
  );
};

export default VideoMessage;