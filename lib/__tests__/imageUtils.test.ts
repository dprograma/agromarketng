/* @jest-environment jsdom */

import {
    getResponsiveSizes,
    getImagePlaceholder,
    getSupportedImageFormat,
    getOptimizedImageUrl,
    getProductImageUrl,
} from '../imageUtils';
import { StaticImageData } from 'next/image';

describe('imageUtils', () => {
    describe('getResponsiveSizes', () => {
        it('should return default sizes string if no custom sizes are provided', () => {
            const defaultSizes = '(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 1280px';
            expect(getResponsiveSizes()).toBe(defaultSizes);
        });

        it('should return a sizes string with custom values', () => {
            const customSizes = {
                small: 700,
                medium: 1100,
                large: 1400,
                default: 1800,
            };
            const expectedSizes = '(max-width: 700px) 100vw, (max-width: 1100px) 50vw, (max-width: 1400px) 33vw, 1800px';
            expect(getResponsiveSizes(customSizes)).toBe(expectedSizes);
        });

        it('should use default values for missing custom sizes', () => {
            const customSizes = {
                small: 900,
            };
            const expectedSizes = '(max-width: 900px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 1280px';
            expect(getResponsiveSizes(customSizes)).toBe(expectedSizes);
        });
    });

    describe('getImagePlaceholder', () => {
        it('should return the placeholder SVG for a local string src', () => {
            const src = '/assets/img/products/image.jpg';
            const expectedPlaceholder = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZlcnNpb249IjEuMSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayI+CiAgPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjZjFmMWYxIi8+Cjwvc3ZnPg==';
            expect(getImagePlaceholder(src)).toBe(expectedPlaceholder);
        });

        it('should return the blurDataURL for a StaticImageData src with blurDataURL', () => {
            const src: StaticImageData = {
                src: '/_next/static/media/image.hash.jpg',
                height: 100,
                width: 100,
                blurDataURL: 'data:image/png;base64,...',
            };
            expect(getImagePlaceholder(src)).toBe(src.blurDataURL);
        });

        it('should return undefined for an empty string src', () => {
            expect(getImagePlaceholder('')).toBeUndefined();
        });

        it('should return undefined for null or undefined src', () => {
            expect(getImagePlaceholder(null as any)).toBeUndefined();
            expect(getImagePlaceholder(undefined as any)).toBeUndefined();
        });
    });

    describe('getSupportedImageFormat', () => {
        // Store original global properties to restore them after each test
        const originalSelf = global.self;
        const originalCanvas = global.HTMLCanvasElement;
        const originalFetch = global.fetch;
        const originalWindow = global.window;

        let mockCreateImageBitmap: jest.Mock;
        let mockCanvasToDataURL: jest.Mock; // Use a dedicated mock for toDataURL

        beforeEach(() => {
            mockCreateImageBitmap = jest.fn();
            mockCanvasToDataURL = jest.fn();

            // Mock global objects and methods
            global.self = { // Cast to any to allow partial mocking
                ...originalSelf,
                createImageBitmap: mockCreateImageBitmap,
            } as any;

            // Mock HTMLCanvasElement.prototype.toDataURL directly
            if (global.HTMLCanvasElement) { // Check if it exists in the environment
                jest.spyOn(global.HTMLCanvasElement.prototype, 'toDataURL').mockImplementation(mockCanvasToDataURL);
            } else {
                // Fallback mock if HTMLCanvasElement is not available (should not happen with jsdom)
                global.HTMLCanvasElement = class MockCanvasElement { // Cast to any
                    getContext() { return {}; }
                    toDataURL = mockCanvasToDataURL; // Assign mock directly
                } as any;
            }

            global.fetch = jest.fn(() =>
                Promise.resolve({
                    blob: () => Promise.resolve(new Blob()),
                } as Response)
            ) as any;

            // Ensure window is defined for client-side tests
            global.window = {} as any; // Provide a minimal mock object
        });

        afterEach(() => {
            // Restore HTMLCanvasElement.prototype.toDataURL spy
            if (global.HTMLCanvasElement && (global.HTMLCanvasElement.prototype.toDataURL as any).mockRestore) {
                (global.HTMLCanvasElement.prototype.toDataURL as any).mockRestore();
            }

            // Restore original global properties
            global.self = originalSelf;
            global.HTMLCanvasElement = originalCanvas;
            global.fetch = originalFetch;
            global.window = originalWindow;

        });

        it('should return the first supported format from the list (AVIF supported)', async () => {
            mockCreateImageBitmap.mockResolvedValue({});
            expect(await getSupportedImageFormat(['avif', 'webp', 'jpg'])).toBe('avif');
        });

        it('should return the next supported format if the first is not supported (WebP supported)', async () => {
            mockCreateImageBitmap.mockRejectedValue(new Error('AVIF not supported'));
            mockCanvasToDataURL.mockReturnValue('data:image/webp'); // Mock toDataURL for webp
            expect(await getSupportedImageFormat(['avif', 'webp', 'jpg'])).toBe('webp');
        });

        it('should return the last format if only it is supported (JPG fallback)', async () => {
            mockCreateImageBitmap.mockRejectedValue(new Error('AVIF not supported'));
            mockCanvasToDataURL.mockReturnValue('data:'); // Mock toDataURL to indicate no webp support
            expect(await getSupportedImageFormat(['avif', 'webp', 'jpg'])).toBe('jpg');
        });

        it.skip('should return the last format if running on the server', async () => {
            // Temporarily set window to undefined to simulate server environment
            const originalWindow = global.window; // Store original window
            global.window = undefined as any;

            try {
                // Ensure the function returns the last format in server environment
                expect(await getSupportedImageFormat(['avif', 'webp', 'jpg'])).toBe('jpg');
            } finally {
                // Restore original window
                global.window = originalWindow;
            }
        });

        it('should return the fallback format if no formats are supported', async () => {
            mockCreateImageBitmap.mockRejectedValue(new Error('AVIF not supported'));
            mockCanvasToDataURL.mockReturnValue('data:'); // Mock toDataURL to indicate no webp support
            expect(await getSupportedImageFormat(['webp', 'png'])).toBe('png');
        });

        it('should return the last format if no formats are provided', async () => {
            expect(await getSupportedImageFormat([])).toBe('jpg');
        });
    });

    describe('getOptimizedImageUrl', () => {
        it('should return the optimized image URL with specified width and format', () => {
            const src = '/assets/img/products/image.jpg';
            const width = 500;
            const format = 'webp';
            const expectedUrl = '/assets/img/products/image.jpg?w=500&q=75&fm=webp';
            expect(getOptimizedImageUrl(src, width, format)).toBe(expectedUrl);
        });

        it('should use default format (webp) if not provided', () => {
            const src = '/assets/img/products/image.png';
            const width = 300;
            const expectedUrl = '/assets/img/products/image.png?w=300&q=75&fm=webp';
            expect(getOptimizedImageUrl(src, width)).toBe(expectedUrl);
        });

        it('should handle different image sources', () => {
            const src = 'https://example.com/images/photo.jpeg';
            const width = 800;
            const expectedUrl = 'https://example.com/images/photo.jpeg';
            expect(getOptimizedImageUrl(src, width)).toBe(expectedUrl);
        });
    });

    describe('getProductImageUrl', () => {
        it('should return the URL of the image at the specified index', () => {
            const images = ['img1.jpg', 'img2.png', 'img3.webp'];
            expect(getProductImageUrl(images, 1)).toBe('img2.png');
        });

        it('should return the placeholder URL if index is out of bounds (negative)', () => {
            const images = ['img1.jpg', 'img2.png'];
            expect(getProductImageUrl(images, -1)).toBe('/assets/img/products/placeholder.jpg');
        });

        it('should return the placeholder URL if index is out of bounds (positive)', () => {
            const images = ['img1.jpg', 'img2.png'];
            expect(getProductImageUrl(images, 5)).toBe('/assets/img/products/placeholder.jpg');
        });

        it('should return the URL of the first image if index is not provided', () => {
            const images = ['img1.jpg', 'img2.png'];
            expect(getProductImageUrl(images)).toBe('img1.jpg');
        });

        it('should return a placeholder URL if images array is empty', () => {
            const images: string[] = [];
            expect(getProductImageUrl(images)).toBe('/assets/img/products/placeholder.jpg');
        });

        it('should return a placeholder URL if images array is undefined', () => {
            expect(getProductImageUrl(undefined)).toBe('/assets/img/products/placeholder.jpg');
        });

        it('should return a placeholder URL if images array is null', () => {
            expect(getProductImageUrl(null as any)).toBe('/assets/img/products/placeholder.jpg');
        });
    });
});