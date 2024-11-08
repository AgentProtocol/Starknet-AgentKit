import storage from 'node-persist'
import crypto from 'crypto';

const STORAGE_ENCRYPTION_KEY = process.env.STORAGE_ENCRYPTION_KEY || 'dK9x#mP2$vL7nQ4@jR5tY8*wC3hF6bN9'; // Should be 32 bytes
const IV_LENGTH = 16; // For AES, this is always 16


// Initialize the storage
(async () => {
    await storage.init({
        dir: 'my_storage', // Directory to store data
        stringify: JSON.stringify, // Function to convert data to string
        parse: JSON.parse, // Function to convert string back to data
        encoding: 'utf8', // Encoding type
        logging: false, // Disable logging
        // Other options can be set here
    });
})();

function encrypt(text: string): string {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(STORAGE_ENCRYPTION_KEY), iv);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return iv.toString('hex') + ':' + encrypted.toString('hex');
}

function decrypt(text: string): string {
    const textParts = text.split(':');
    const iv = Buffer.from(textParts[0], 'hex');
    const encryptedText = Buffer.from(textParts[1], 'hex');
    const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(STORAGE_ENCRYPTION_KEY), iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
}

export async function saveToStorage(key: string, value: any): Promise<void> {
    try {
        const stringValue = JSON.stringify(value);
        const encryptedValue = encrypt(stringValue);
        await storage.setItem(key, encryptedValue);
    } catch (error) {
        console.error('Error saving to storage:', error);
        throw error;
    }
}

export async function readFromStorage(key: string): Promise<any> {
    try {
        const encryptedValue = await storage.getItem(key);
        if (!encryptedValue) {
            return null;
        }
        const decryptedValue = decrypt(encryptedValue);
        return JSON.parse(decryptedValue);
    } catch (error) {
        console.error('Error reading from storage:', error);
        throw error;
    }
}

export async function removeFromStorage(key: string): Promise<void> {
    try {
        await storage.removeItem(key);
    } catch (error) {
        console.error('Error removing from storage:', error);
        throw error;
    }
}

export async function clearStorage(): Promise<void> {
    try {
        await storage.clear();
    } catch (error) {
        console.error('Error clearing storage:', error);
        throw error;
    }
}
