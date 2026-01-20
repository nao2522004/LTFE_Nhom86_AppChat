export interface ParsedMessage {
  type: 'text' | 'image' | 'video' | 'mixed';
  text?: string;
  imageUrls?: string[];
  videoUrls?: string[];
}

export const parseMessage = (message: string): ParsedMessage => {
  const imageRegex = /\[IMAGE\](.*?)\[\/IMAGE\]/g;
  const videoRegex = /\[VIDEO\](.*?)\[\/VIDEO\]/g;
  const imageUrls: string[] = [];
  const videoUrls: string[] = [];
  let match;

  while ((match = imageRegex.exec(message)) !== null) {
    imageUrls.push(match[1]);
  }

  while ((match = videoRegex.exec(message)) !== null) {
    videoUrls.push(match[1]);
  }

  const text = message
    .replace(imageRegex, '')
    .replace(videoRegex, '')
    .trim();

  const hasImages = imageUrls.length > 0;
  const hasVideos = videoUrls.length > 0;
  const hasText = text.length > 0;

  if ((hasImages || hasVideos) && hasText) {
    return {
      type: 'mixed',
      text,
      imageUrls,
      videoUrls
    };
  } else if (hasImages && hasVideos) {
    return {
      type: 'mixed',
      imageUrls,
      videoUrls
    };
  } else if (hasImages) {
    return {
      type: 'image',
      imageUrls
    };
  } else if (hasVideos) {
    return {
      type: 'video',
      videoUrls
    };
  } else {
    return {
      type: 'text',
      text: message
    };
  }
};

export const formatMessageWithImages = (text: string, imageUrls: string[]): string => {
  const imageText = imageUrls.map(url => `[IMAGE]${url}[/IMAGE]`).join('\n');
  
  if (text && imageUrls.length > 0) {
    return `${text}\n${imageText}`;
  } else if (imageUrls.length > 0) {
    return imageText;
  } else {
    return text;
  }
};

export const formatMessageWithVideos = (text: string, videoUrls: string[]): string => {
  const videoText = videoUrls.map(url => `[VIDEO]${url}[/VIDEO]`).join('\n');
  
  if (text && videoUrls.length > 0) {
    return `${text}\n${videoText}`;
  } else if (videoUrls.length > 0) {
    return videoText;
  } else {
    return text;
  }
};

export const formatMessageWithMedia = (
  text: string, 
  imageUrls: string[], 
  videoUrls: string[]
): string => {
  const imageText = imageUrls.map(url => `[IMAGE]${url}[/IMAGE]`).join('\n');
  const videoText = videoUrls.map(url => `[VIDEO]${url}[/VIDEO]`).join('\n');
  
  const mediaParts: string[] = [];
  
  if (text) mediaParts.push(text);
  if (imageText) mediaParts.push(imageText);
  if (videoText) mediaParts.push(videoText);
  
  return mediaParts.join('\n');
};

export const isValidImageUrl = (url: string): boolean => {
  try {
    const urlObj = new URL(url);
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp'];
    const pathname = urlObj.pathname.toLowerCase();
    
    return imageExtensions.some(ext => pathname.endsWith(ext)) || 
           urlObj.hostname.includes('cloudinary.com');
  } catch {
    return false;
  }
};

export const isValidVideoUrl = (url: string): boolean => {
  try {
    const urlObj = new URL(url);
    const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov', '.avi'];
    const pathname = urlObj.pathname.toLowerCase();
    
    return videoExtensions.some(ext => pathname.endsWith(ext)) || 
           (urlObj.hostname.includes('cloudinary.com') && pathname.includes('/video/'));
  } catch {
    return false;
  }
};

export const stripHTML = (html: string): string => {
  const tmp = document.createElement('DIV');
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || '';
};

export const hasHTMLTags = (text: string): boolean => {
  return /<\/?[a-z][\s\S]*>/i.test(text);
};