import React, { useState, useRef, forwardRef, useImperativeHandle } from 'react';
import { X, Image as ImageIcon, Video } from 'lucide-react';
import styles from './MediaPicker.module.css';

interface MediaPickerProps {
  onMediaSelected: (files: File[]) => void;
  maxFiles?: number;
  disabled?: boolean;
}

interface PreviewMedia {
  file: File;
  preview: string;
  id: string;
  type: 'image' | 'video';
}

export interface MediaPickerHandle {
  clear: () => void;
}

const MediaPicker = forwardRef<MediaPickerHandle, MediaPickerProps>(({ 
  onMediaSelected, 
  maxFiles = 5,
  disabled = false 
}, ref) => {
  const [previewMedia, setPreviewMedia] = useState<PreviewMedia[]>([]);
  const [showMenu, setShowMenu] = useState(false);
  const fileInputImageRef = useRef<HTMLInputElement>(null);
  const fileInputVideoRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useImperativeHandle(ref, () => ({
    clear: () => {
      setPreviewMedia([]);
      if (fileInputImageRef.current) fileInputImageRef.current.value = '';
      if (fileInputVideoRef.current) fileInputVideoRef.current.value = '';
      onMediaSelected([]);
    }
  }));

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMenu]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'video') => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const remainingSlots = maxFiles - previewMedia.length;
    const filesToAdd = files.slice(0, remainingSlots);

    const validFiles = filesToAdd.filter(file => {
      if (type === 'image') {
        return file.type.startsWith('image/');
      } else {
        return file.type.startsWith('video/');
      }
    });

    const newPreviews = validFiles.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      id: Math.random().toString(36).substr(2, 9),
      type
    }));

    const updatedPreviews = [...previewMedia, ...newPreviews];
    setPreviewMedia(updatedPreviews);
    onMediaSelected(updatedPreviews.map(p => p.file));
    setShowMenu(false);
  };

  const removeMedia = (id: string) => {
    const updatedPreviews = previewMedia.filter(media => media.id !== id);
    setPreviewMedia(updatedPreviews);
    onMediaSelected(updatedPreviews.map(p => p.file));
    
    if (fileInputImageRef.current && updatedPreviews.length === 0) {
      fileInputImageRef.current.value = '';
    }
    if (fileInputVideoRef.current && updatedPreviews.length === 0) {
      fileInputVideoRef.current.value = '';
    }
  };

  const clearAll = () => {
    setPreviewMedia([]);
    onMediaSelected([]);
    if (fileInputImageRef.current) fileInputImageRef.current.value = '';
    if (fileInputVideoRef.current) fileInputVideoRef.current.value = '';
  };

  const handleImageClick = () => {
    fileInputImageRef.current?.click();
    setShowMenu(false);
  };

  const handleVideoClick = () => {
    fileInputVideoRef.current?.click();
    setShowMenu(false);
  };

  return (
    <div className="media-picker">
      <input
        ref={fileInputImageRef}
        type="file"
        accept="image/*"
        multiple
        onChange={(e) => handleFileSelect(e, 'image')}
        style={{ display: 'none' }}
        disabled={disabled || previewMedia.length >= maxFiles}
      />
      
      <input
        ref={fileInputVideoRef}
        type="file"
        accept="video/*"
        multiple
        onChange={(e) => handleFileSelect(e, 'video')}
        style={{ display: 'none' }}
        disabled={disabled || previewMedia.length >= maxFiles}
      />

      <div style={{ position: 'relative' }} ref={menuRef}>
        <button
          type="button"
          onClick={() => setShowMenu(!showMenu)}
          disabled={disabled || previewMedia.length >= maxFiles}
          className={styles.mediaPickerButton}
          title="Chọn ảnh hoặc video"
        >
          <ImageIcon size={20} />
        </button>

        {showMenu && (
          <div className={styles.dropdownMenu}>
            <button
              type="button"
              onClick={handleImageClick}
              className={styles.menuItem}
              disabled={disabled || previewMedia.length >= maxFiles}
            >
              <ImageIcon size={18} />
              <span>Chọn ảnh</span>
            </button>
            <button
              type="button"
              onClick={handleVideoClick}
              className={styles.menuItem}
              disabled={disabled || previewMedia.length >= maxFiles}
            >
              <Video size={18} />
              <span>Chọn video</span>
            </button>
          </div>
        )}
      </div>

      {previewMedia.length > 0 && (
        <div className={styles.mediaPreviewContainer}>
          <div className={styles.mediaPreviewHeader}>
            <span>{previewMedia.length} file đã chọn</span>
            <button 
              type="button" 
              onClick={clearAll}
              className={styles.clearAllButton}
            >
              Xóa tất cả
            </button>
          </div>
          <div className={styles.mediaPreviewGrid}>
            {previewMedia.map((media) => (
              <div key={media.id} className={styles.mediaPreviewItem}>
                {media.type === 'image' ? (
                  <img src={media.preview} alt="Preview" />
                ) : (
                  <div className={styles.videoPreview}>
                    <video src={media.preview} />
                    <div className={styles.videoOverlay}>
                      <Video size={24} />
                    </div>
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => removeMedia(media.id)}
                  className={styles.removeMediaButton}
                >
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
});

export default MediaPicker;