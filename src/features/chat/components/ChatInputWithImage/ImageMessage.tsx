import React, { useState } from 'react';
import { X, ZoomIn, Download, ImageOff } from 'lucide-react';
import styles from './ImageMessage.module.css';

interface ImageMessageProps {
  imageUrls: string[];
  caption?: string;
}

const ImageMessage: React.FC<ImageMessageProps> = ({ imageUrls, caption }) => {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});

  const handleImageError = (url: string) => {
    setFailedImages(prev => ({
      ...prev,
      [url]: true
    }));
  };

  const openLightbox = (index: number) => {
    setSelectedImageIndex(index);
    setLightboxOpen(true);
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
  };

  const nextImage = () => {
    setSelectedImageIndex((prev) => (prev + 1) % imageUrls.length);
  };

  const prevImage = () => {
    setSelectedImageIndex((prev) => (prev - 1 + imageUrls.length) % imageUrls.length);
  };

  const downloadImage = (url: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = url.split('/').pop() || 'image.jpg';
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!lightboxOpen) return;
    
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowRight') nextImage();
    if (e.key === 'ArrowLeft') prevImage();
  };

  React.useEffect(() => {
    const handleKeyDownGlobal = (e: KeyboardEvent) => {
      if (!lightboxOpen) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowRight') nextImage();
      if (e.key === 'ArrowLeft') prevImage();
    };

    document.addEventListener('keydown', handleKeyDownGlobal);
    return () => document.removeEventListener('keydown', handleKeyDownGlobal);
  }, [lightboxOpen]);

  const gridCount = Math.min(imageUrls.length, 4);
  const gridLayoutClass = styles[`imageGrid${gridCount}`];

  return (
    <>
      <div className={styles.imageMessage}>
        {caption && <p className={styles.imageCaption}>{caption}</p>}
        
        <div className={`${styles.imageGrid} ${gridLayoutClass}`}>
          {imageUrls.map((url, index) => {
            const isFailed = failedImages[url];

            return (
              <div 
                key={index} 
                className={styles.imageGridItem}
                onClick={() => openLightbox(index)}
                style={{ cursor: isFailed ? 'default' : 'pointer' }}
              >
                {isFailed ? (
                  <div style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#e0e0e0',
                    color: '#757575',
                    fontSize: '12px'
                  }}>
                    <ImageOff size={24} style={{ marginBottom: '4px' }} />
                    <span>Ảnh bị lỗi</span>
                  </div>
                ) : (
                  <>
                    <img 
                      src={url} 
                      alt={`Image ${index + 1}`} 
                      onError={() => handleImageError(url)}
                    />
                    <div className={styles.imageOverlay}>
                      <ZoomIn size={24} />
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {lightboxOpen && (
        <div className={styles.lightbox} onClick={closeLightbox}>
          <button className={styles.lightboxClose} onClick={closeLightbox}>
            <X size={32} />
          </button>

          {!failedImages[imageUrls[selectedImageIndex]] && (
             <button 
                className={styles.lightboxDownload} 
                onClick={(e) => {
                  e.stopPropagation();
                  downloadImage(imageUrls[selectedImageIndex]);
                }}
              >
                <Download size={24} />
              </button>
          )}

          <div className={styles.lightboxContent} onClick={(e) => e.stopPropagation()}>
            {failedImages[imageUrls[selectedImageIndex]] ? (
                <div style={{ color: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <ImageOff size={48} />
                    <p style={{ marginTop: 10 }}>Không thể tải ảnh này</p>
                </div>
             ) : (
                <img 
                  src={imageUrls[selectedImageIndex]} 
                  alt={`Image ${selectedImageIndex + 1}`}
                  onError={() => handleImageError(imageUrls[selectedImageIndex])}
                />
             )}
          </div>

          {imageUrls.length > 1 && (
            <>
              <button 
                className={`${styles.lightboxNav} ${styles.lightboxPrev}`} 
                onClick={(e) => {
                  e.stopPropagation();
                  prevImage();
                }}
              >
                ‹
              </button>
              <button 
                className={`${styles.lightboxNav} ${styles.lightboxNext}`} 
                onClick={(e) => {
                  e.stopPropagation();
                  nextImage();
                }}
              >
                ›
              </button>
              <div className={styles.lightboxCounter}>
                {selectedImageIndex + 1} / {imageUrls.length}
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
};

export default ImageMessage;