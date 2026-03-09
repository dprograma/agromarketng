/**
 * File content validation via magic byte inspection.
 * Validates that uploaded files are actually images, not disguised executables.
 */

/** Magic byte signatures for allowed image formats */
const IMAGE_SIGNATURES: Record<string, { bytes: number[]; offset: number }[]> = {
  'image/jpeg': [
    { bytes: [0xFF, 0xD8, 0xFF], offset: 0 },
  ],
  'image/png': [
    { bytes: [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A], offset: 0 },
  ],
  'image/webp': [
    { bytes: [0x52, 0x49, 0x46, 0x46], offset: 0 }, // RIFF header (also check WEBP at offset 8)
  ],
};

/** Known executable/dangerous file signatures to block */
const BLOCKED_SIGNATURES = [
  { name: 'EXE/DLL (Windows)', bytes: [0x4D, 0x5A], offset: 0 },
  { name: 'ELF (Linux binary)', bytes: [0x7F, 0x45, 0x4C, 0x46], offset: 0 },
  { name: 'PDF', bytes: [0x25, 0x50, 0x44, 0x46], offset: 0 },
  { name: 'ZIP/JAR archive', bytes: [0x50, 0x4B, 0x03, 0x04], offset: 0 },
  { name: 'RAR archive', bytes: [0x52, 0x61, 0x72, 0x21], offset: 0 },
  { name: '7-Zip archive', bytes: [0x37, 0x7A, 0xBC, 0xAF, 0x27, 0x1C], offset: 0 },
  { name: 'Shell script', bytes: [0x23, 0x21], offset: 0 },
  { name: 'Java class', bytes: [0xCA, 0xFE, 0xBA, 0xBE], offset: 0 },
  { name: 'Mach-O (macOS binary)', bytes: [0xFE, 0xED, 0xFA, 0xCE], offset: 0 },
  { name: 'Mach-O (macOS binary)', bytes: [0xFE, 0xED, 0xFA, 0xCF], offset: 0 },
];

function matchesBytes(buffer: Buffer, signature: number[], offset: number): boolean {
  if (buffer.length < offset + signature.length) return false;
  return signature.every((byte, i) => buffer[offset + i] === byte);
}

/**
 * Validate that a file's actual content matches its claimed MIME type
 * by inspecting magic bytes. Blocks known executable formats.
 */
export function validateFileMagicBytes(
  buffer: Buffer,
  claimedMimeType: string
): { isValid: boolean; error?: string } {
  // Block known executable/dangerous formats regardless of claimed type
  for (const blocked of BLOCKED_SIGNATURES) {
    if (matchesBytes(buffer, blocked.bytes, blocked.offset)) {
      return {
        isValid: false,
        error: `File appears to be a ${blocked.name} file. Only image files (JPEG, PNG, WebP) are allowed.`,
      };
    }
  }

  // Verify magic bytes match the claimed image MIME type
  const signatures = IMAGE_SIGNATURES[claimedMimeType];
  if (!signatures) {
    return {
      isValid: false,
      error: `Unsupported file type: ${claimedMimeType}. Only JPEG, PNG, and WebP are allowed.`,
    };
  }

  const matchesAny = signatures.some(({ bytes, offset }) =>
    matchesBytes(buffer, bytes, offset)
  );

  if (!matchesAny) {
    return {
      isValid: false,
      error: `File content does not match claimed type (${claimedMimeType}). The file may be corrupted or disguised.`,
    };
  }

  // Extra check for WebP: bytes 8-11 must spell "WEBP"
  if (claimedMimeType === 'image/webp') {
    if (
      buffer.length < 12 ||
      buffer[8] !== 0x57 || buffer[9] !== 0x45 ||
      buffer[10] !== 0x42 || buffer[11] !== 0x50
    ) {
      return {
        isValid: false,
        error: 'File has RIFF header but is not a valid WebP image.',
      };
    }
  }

  return { isValid: true };
}
