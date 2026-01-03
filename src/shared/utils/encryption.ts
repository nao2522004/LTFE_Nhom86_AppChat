class TokenEncryption {
    private readonly ALGORITHM = 'AES-GCM';
    private readonly KEY_LENGTH = 256;
    private readonly IV_LENGTH = 12;
    private readonly SALT_LENGTH = 16;
    private readonly SECRET_KEY = 'my-secret-key-app-chat';

    private async deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
        const encoder = new TextEncoder();
        const passwordBuffer = encoder.encode(password);

        const baseKey = await crypto.subtle.importKey(
            'raw',
            passwordBuffer,
            'PBKDF2',
            false,
            ['deriveBits', 'deriveKey']
        );

        return crypto.subtle.deriveKey(
            {
                name: 'PBKDF2',
                salt: salt as BufferSource,
                iterations: 100000,
                hash: 'SHA-256'
            },
            baseKey,
            {
                name: this.ALGORITHM,
                length: this.KEY_LENGTH
            },
            false,
            ['encrypt', 'decrypt']
        );
    }

    async encrypt(token: string): Promise<string> {
        try {
            const encoder = new TextEncoder();
            const data = encoder.encode(token);

            const salt = crypto.getRandomValues(new Uint8Array(this.SALT_LENGTH));
            const iv = crypto.getRandomValues(new Uint8Array(this.IV_LENGTH));

            const key = await this.deriveKey(this.SECRET_KEY, salt);

            const encryptedData = await crypto.subtle.encrypt(
                {
                    name: this.ALGORITHM,
                    iv: iv
                },
                key,
                data
            );

            const combined = new Uint8Array(
                salt.length + iv.length + encryptedData.byteLength
            );
            combined.set(salt, 0);
            combined.set(iv, salt.length);
            combined.set(new Uint8Array(encryptedData), salt.length + iv.length);

            return this.arrayBufferToBase64(combined);
        } catch (error) {
            console.error('Encryption failed:', error);
            throw new Error('Failed to encrypt token');
        }
    }

    async decrypt(encryptedToken: string): Promise<string> {
        try {
            const combined = this.base64ToArrayBuffer(encryptedToken);

            const salt = combined.slice(0, this.SALT_LENGTH);
            const iv = combined.slice(this.SALT_LENGTH, this.SALT_LENGTH + this.IV_LENGTH);
            const encryptedData = combined.slice(this.SALT_LENGTH + this.IV_LENGTH);

            const key = await this.deriveKey(this.SECRET_KEY, salt);

            const decryptedData = await crypto.subtle.decrypt(
                {
                    name: this.ALGORITHM,
                    iv: iv
                },
                key,
                encryptedData
            );

            const decoder = new TextDecoder();
            return decoder.decode(decryptedData);
        } catch (error) {
            console.error('Decryption failed:', error);
            throw new Error('Failed to decrypt token');
        }
    }

    private arrayBufferToBase64(buffer: Uint8Array): string {
        let binary = '';
        const len = buffer.byteLength;
        for (let i = 0; i < len; i++) {
            binary += String.fromCharCode(buffer[i]);
        }
        return btoa(binary);
    }

    private base64ToArrayBuffer(base64: string): Uint8Array {
        const binary = atob(base64);
        const len = binary.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
            bytes[i] = binary.charCodeAt(i);
        }
        return bytes;
    }
}

// Singleton instance
export const tokenEncryption = new TokenEncryption();

// Helper functions
export const encryptToken = (token: string) => tokenEncryption.encrypt(token);
export const decryptToken = (encryptedToken: string) => tokenEncryption.decrypt(encryptedToken);