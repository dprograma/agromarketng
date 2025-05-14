import { StaticImageData } from "next/image";

/**
 * Interface for responsive image sizes
 */
export interface ResponsiveImageSizes {
  small: number;
  medium: number;
  large: number;
  default: number;
}

/**
 * Default responsive image sizes
 */
export const defaultSizes: ResponsiveImageSizes = {
  small: 640,
  medium: 768,
  large: 1024,
  default: 1280,
};

/**
 * Generate responsive image sizes string for Next.js Image component
 * @param customSizes Optional custom sizes
 * @returns Sizes string for Next.js Image component
 */
export function getResponsiveSizes(customSizes?: Partial<ResponsiveImageSizes>): string {
  const sizes = { ...defaultSizes, ...customSizes };
  return `(max-width: ${sizes.small}px) 100vw, (max-width: ${sizes.medium}px) 50vw, (max-width: ${sizes.large}px) 33vw, ${sizes.default}px`;
}

/**
 * Get image placeholder for Next.js Image component
 * @param src Image source
 * @returns Placeholder blur data URL or undefined
 */
export function getImagePlaceholder(src: string | StaticImageData): string | undefined {
  // If it's a StaticImageData object with blurDataURL, return it
  if (typeof src !== 'string' && src.blurDataURL) {
    return src.blurDataURL;
  }
  
  // For external URLs, return undefined (Next.js will handle it)
  if (typeof src === 'string' && (src.startsWith('http://') || src.startsWith('https://'))) {
    return undefined;
  }
  
  // For local images without blur data, return a tiny placeholder
  return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZlcnNpb249IjEuMSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayI+CiAgPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjZjFmMWYxIi8+Cjwvc3ZnPg==';
}

/**
 * Get image format based on browser support
 * @param formats Array of supported formats in order of preference
 * @returns The first supported format or fallback to 'jpg'
 */
export function getSupportedImageFormat(formats: string[] = ['avif', 'webp', 'jpg']): string {
  // This function is client-side only
  if (typeof window === 'undefined') {
    return formats[formats.length - 1]; // Return fallback format on server
  }

  // Check for AVIF support
  if (formats.includes('avif') && self.createImageBitmap) {
    const avifData = 'data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAAB0AAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAIAAAACAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQ0MAAAAABNjb2xybmNseAACAAIAAYAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAACVtZGF0EgAKCBgANogQEAwgMg8f8D///8WfhwB8+ErK42A=';
    return fetch(avifData).then(() => 'avif').catch(() => getSupportedImageFormat(formats.filter(f => f !== 'avif')));
  }

  // Check for WebP support
  if (formats.includes('webp')) {
    const webp = document.createElement('canvas').toDataURL('image/webp');
    if (webp.indexOf('data:image/webp') === 0) {
      return 'webp';
    }
  }

  // Fallback to jpg/png
  return formats.find(f => f === 'jpg' || f === 'png') || 'jpg';
}

/**
 * Get optimized image URL with format and size
 * @param src Original image URL
 * @param width Desired width
 * @param format Image format (webp, avif, etc.)
 * @returns Optimized image URL
 */
export function getOptimizedImageUrl(src: string, width: number, format: string = 'webp'): string {
  // For external URLs, return as is
  if (src.startsWith('http://') || src.startsWith('https://')) {
    return src;
  }
  
  // For local images, add query parameters for Next.js Image Optimization API
  const baseUrl = src.split('?')[0];
  return `${baseUrl}?w=${width}&q=75&fm=${format}`;
}

/**
 * Get product image URL with fallback
 * @param images Array of image URLs
 * @param index Index of the image to get
 * @returns Image URL or fallback
 */
export function getProductImageUrl(images: string[] | undefined, index: number = 0): string {
  if (!images || images.length === 0) {
    return '/assets/img/products/placeholder.jpg';
  }
  
  const image = images[index];
  if (!image) {
    return '/assets/img/products/placeholder.jpg';
  }
  
  return image;
}
