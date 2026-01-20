import Compressor from 'compressorjs';

interface CloudinaryResponse {
  secure_url: string;
  public_id: string;
  width: number;
  height: number;
  format: string;
}

class CloudinaryService {
  private cloudName: string;
  private uploadPreset: string;
  private cloudVideoName: string;
  private uploadVideoPreset: string;
  

  constructor() {
    this.cloudName = process.env.REACT_APP_CLOUDINARY_IMAGE_CLOUD_NAME || 'your_cloud_name';
    this.uploadPreset = process.env.REACT_APP_CLOUDINARY_IMAGE_UPLOAD_PRESET || 'your_upload_preset';
    this.cloudVideoName = process.env.REACT_APP_CLOUDINARY_VIDEO_CLOUD_NAME || 'your_video_cloud_name';
    this.uploadVideoPreset = process.env.REACT_APP_CLOUDINARY_VIDEO_UPLOAD_PRESET || 'your_video_upload_preset';
  }

  private compressImage(file: File): Promise<File> {
    return new Promise((resolve, reject) => {
      new Compressor(file, {
        quality: 0.8,
        maxWidth: 1920,
        maxHeight: 1920,
        mimeType: 'image/jpeg',
        success: (result) => {
          const compressedFile = new File([result], file.name, {
            type: result.type,
            lastModified: Date.now(),
          });
          resolve(compressedFile);
        },
        error: (err) => {
          reject(err);
        },
      });
    });
  }

  async uploadImage(file: File, onProgress?: (progress: number) => void): Promise<CloudinaryResponse> {
    try {
      // Compressing image
      const compressedFile = await this.compressImage(file);

      const formData = new FormData();
      formData.append('file', compressedFile);
      formData.append('upload_preset', this.uploadPreset);
      formData.append('folder', 'LTFE/chat-images');

      const xhr = new XMLHttpRequest();
      
      return new Promise((resolve, reject) => {
        // Upload progress
        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable && onProgress) {
            const progress = Math.round((e.loaded / e.total) * 100);
            onProgress(progress);
          }
        });

        xhr.addEventListener('load', () => {
          if (xhr.status === 200) {
            const response: CloudinaryResponse = JSON.parse(xhr.responseText);
            resolve(response);
          } else {
            reject(new Error(`Upload failed with status ${xhr.status}`));
          }
        });

        xhr.addEventListener('error', () => {
          reject(new Error('Network error occurred during upload'));
        });

        xhr.open('POST', `https://api.cloudinary.com/v1_1/${this.cloudName}/image/upload`);
        xhr.send(formData);
      });
    } catch (error) {
      throw new Error(`Failed to upload image: ${error}`);
    }
  }

  async uploadMultipleImages(
    files: File[], 
    onProgress?: (fileIndex: number, progress: number) => void
  ): Promise<CloudinaryResponse[]> {
    const uploadPromises = files.map((file, index) => 
      this.uploadImage(file, (progress) => {
        if (onProgress) {
          onProgress(index, progress);
        }
      })
    );

    return Promise.all(uploadPromises);
  }

  async uploadVideo(file: File, onProgress?: (progress: number) => void): Promise<CloudinaryResponse> {
    try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', this.uploadVideoPreset);
        formData.append('folder', 'LTFE/chat-videos');
        formData.append('resource_type', 'video');

        const xhr = new XMLHttpRequest();
        
        return new Promise((resolve, reject) => {
            xhr.upload.addEventListener('progress', (e) => {
                if (e.lengthComputable && onProgress) {
                    const progress = Math.round((e.loaded / e.total) * 100);
                    onProgress(progress);
                }
            });

            xhr.addEventListener('load', () => {
                if (xhr.status === 200) {
                    const response: CloudinaryResponse = JSON.parse(xhr.responseText);
                    resolve(response);
                } else {
                    reject(new Error(`Upload failed with status ${xhr.status}`));
                }
            });

            xhr.addEventListener('error', () => {
                reject(new Error('Network error occurred during upload'));
            });

            xhr.open('POST', `https://api.cloudinary.com/v1_1/${this.cloudVideoName}/video/upload`);
            xhr.send(formData);
        });
    } catch (error) {
        throw new Error(`Failed to upload video: ${error}`);
    }
}

async uploadMultipleVideos(
    files: File[], 
    onProgress?: (fileIndex: number, progress: number) => void
): Promise<CloudinaryResponse[]> {
    const uploadPromises = files.map((file, index) => 
        this.uploadVideo(file, (progress) => {
            if (onProgress) {
                onProgress(index, progress);
            }
        })
    );

    return Promise.all(uploadPromises);
}
}

export const cloudinaryService = new CloudinaryService();
export default cloudinaryService;