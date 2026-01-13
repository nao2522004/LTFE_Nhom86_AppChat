import React from 'react';
import { Loader2 } from 'lucide-react';
import styles from './UploadProgress.module.css';

interface UploadProgressProps {
  progress: number;
  fileName?: string;
}

const UploadProgress: React.FC<UploadProgressProps> = ({ progress, fileName }) => {
  return (
    <div className={styles.uploadProgressOverlay}>
      <div className={styles.uploadProgressContent}>
        <Loader2 className={styles.spinner} size={32} />
        <div className={styles.uploadProgressInfo}>
          <p className={styles.uploadProgressText}>
            {fileName ? `Đang tải lên: ${fileName}` : 'Đang tải lên...'}
          </p>
          <div className={styles.uploadProgressBar}>
            <div 
              className={styles.uploadProgressBarFill} 
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className={styles.uploadProgressPercentage}>{progress}%</p>
        </div>
      </div>
    </div>
  );
};

export default UploadProgress;