import React, { useState, useRef, forwardRef, useImperativeHandle } from 'react';
import { X, Image as ImageIcon } from 'lucide-react';
import styles from './ImagePicker.module.css';

interface ImagePickerProps {
  onImagesSelected: (files: File[]) => void;
  maxImages?: number;
  disabled?: boolean;
}

interface PreviewImage {
  file: File;
  preview: string;
  id: string;
}

export interface ImagePickerHandle {
  clear: () => void;
}

const ImagePicker = forwardRef<ImagePickerHandle, ImagePickerProps>(({ 
  onImagesSelected, 
  maxImages = 5,
  disabled = false 
}, ref) => {
  const [previewImages, setPreviewImages] = useState<PreviewImage[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useImperativeHandle(ref, () => ({
    clear: () => {
      // Remove preview
      setPreviewImages([]);
      // Reset input file
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      onImagesSelected([]); 
    }
  }));

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const remainingSlots = maxImages - previewImages.length;
    const filesToAdd = files.slice(0, remainingSlots);

    const validFiles = filesToAdd.filter(file => file.type.startsWith('image/'));

    const newPreviews = validFiles.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      id: Math.random().toString(36).substr(2, 9)
    }));

    const updatedPreviews = [...previewImages, ...newPreviews];
    setPreviewImages(updatedPreviews);
    
    // Emit files to parent
    onImagesSelected(updatedPreviews.map(p => p.file));
  };

  const removeImage = (id: string) => {
    const updatedPreviews = previewImages.filter(img => img.id !== id);
    setPreviewImages(updatedPreviews);
    onImagesSelected(updatedPreviews.map(p => p.file));
    
    // Reset input value to allow selecting the same file again if needed
    if (fileInputRef.current && updatedPreviews.length === 0) {
      fileInputRef.current.value = '';
    }
  };

  const clearAll = () => {
    setPreviewImages([]);
    onImagesSelected([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="image-picker">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileSelect}
        style={{ display: 'none' }}
        disabled={disabled || previewImages.length >= maxImages}
      />

      <button
        type="button"
        onClick={handleButtonClick}
        disabled={disabled || previewImages.length >= maxImages}
        className={styles.imagePickerButton}
        title="Chọn ảnh"
      >
        <ImageIcon size={20} />
      </button>

      {previewImages.length > 0 && (
        <div className={styles.imagePreviewContainer}>
          <div className={styles.imagePreviewHeader}>
            <span>{previewImages.length} ảnh đã chọn</span>
            <button 
              type="button" 
              onClick={clearAll}
              className={styles.clearAllButton}
            >
              Xóa tất cả
            </button>
          </div>
          <div className={styles.imagePreviewGrid}>
            {previewImages.map((img) => (
              <div key={img.id} className={styles.imagePreviewItem}>
                <img src={img.preview} alt="Preview" />
                <button
                  type="button"
                  onClick={() => removeImage(img.id)}
                  className={styles.removeImageButton}
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

export default ImagePicker;