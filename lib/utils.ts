import imageCompression from 'browser-image-compression';

export async function compressImageIfNeeded(base64: string): Promise<string> {
    const data = atob(base64.split(',')[1]);
    const mime = base64.split(',')[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
    const buf = new ArrayBuffer(data.length);
    const arr = new Uint8Array(buf);

    for (let i = 0; i < data.length; i++) {
        arr[i] = data.charCodeAt(i);
    }

    const original = new File([buf], 'temp', { type: mime });
    if (original.size > 5 * 1024 * 1024) {
        const compressed = await imageCompression(original, {
            maxSizeMB: 5,
            maxWidthOrHeight: 2560,
            useWebWorker: true,
        });
        return new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(compressed);
        });
    }
    return base64;
}

export function blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
}

