import { writeFile } from 'fs/promises';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';

export async function saveLocalFile(file: File): Promise<string> {
  try {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create unique filename
    const timestamp = Date.now();
    const uniqueId = uuidv4().split('-')[0];
    const extension = file.name.split('.').pop()?.toLowerCase() || '';
    const fileName = `${timestamp}-${uniqueId}.${extension}`;

    // Save file to local uploads directory
    const path = join(process.cwd(), 'public', 'uploads', fileName);
    await writeFile(path, buffer);

    // Return the public URL
    return `/uploads/${fileName}`;
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

  // Validate file type
  const allowedTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];
  
  if (!allowedTypes.includes(file.type)) {
    throw new Error(`File type ${file.type} is not supported`);
  }

  return true;
}