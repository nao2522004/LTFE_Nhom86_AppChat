export interface ParsedMessage {
  type: 'text' | 'image' | 'mixed';
  text?: string;
  imageUrls?: string[];
}

export const parseMessage = (message: string): ParsedMessage => {
  const imageRegex = /\[IMAGE\](.*?)\[\/IMAGE\]/g;
  const imageUrls: string[] = [];
  let match;

  // Extract all image URLs
  while ((match = imageRegex.exec(message)) !== null) {
    imageUrls.push(match[1]);
  }

  // Remove image tags from text
  const text = message.replace(imageRegex, '').trim();

  if (imageUrls.length > 0 && text) {
    return {
      type: 'mixed',
      text,
      imageUrls
    };
  } else if (imageUrls.length > 0) {
    return {
      type: 'image',
      imageUrls
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