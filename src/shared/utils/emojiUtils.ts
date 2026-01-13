import * as emoji from 'node-emoji';

export interface EmojiMapping {
    emoji: string;
    shortcode: string;
    keywords: string[];
}

export function encodeEmoji(text: string): string {
    let encoded = emoji.unemojify(text);

    encoded = encoded.replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g, "");

    return encoded;
}

export function decodeEmoji(text: string): string {
    return emoji.emojify(text);
}