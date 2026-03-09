import { uploadToCloudinary } from '@/lib/cloudinary';

export async function saveLocalFile(file: File): Promise<string> {
  try {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const timestamp = Date.now();
    const uniqueId = Math.random().toString(36).substring(7);
    const result = await uploadToCloudinary(buffer, 'ads', `${timestamp}-${uniqueId}`);

    return result.url;
  } catch (error) {
    console.error('Error saving file:', error);
    throw new Error('Failed to save file');
  }
}

export function validateFile(file: File) {
  // Validate file size (5MB limit)
  const MAX_FILE_SIZE = 5 * 1024 * 1024;
  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`File ${file.name} exceeds 5MB limit`);
  }

  // Validate file type — only images allowed
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    throw new Error(`File type ${file.type} is not supported. Only JPEG, PNG, and WebP are allowed.`);
  }

  return true;
}
