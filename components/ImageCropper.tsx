"use client";

import React, { useState, useRef, useEffect } from 'react';
import ReactCrop, {
  Crop,
  PixelCrop,
  centerCrop,
  makeAspectCrop,
} from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { Button } from '@/components/ui/button';
import { Loader2, Check, X, RotateCcw } from 'lucide-react';

interface ImageCropperProps {
  src: string;
  onCropComplete: (croppedImageFile: File) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

// Helper function to create a crop centered and with aspect ratio 1:1
function centerAspectCrop(
  mediaWidth: number,
  mediaHeight: number,
  aspect: number,
) {
  return centerCrop(
    makeAspectCrop(
      {
        unit: '%',
        width: 90,
      },
      aspect,
      mediaWidth,
      mediaHeight,
    ),
    mediaWidth,
    mediaHeight,
  )
}

// Helper function to create a cropped image file
async function getCroppedImg(
  image: HTMLImageElement,
  crop: PixelCrop,
  fileName: string = 'cropped-image.jpg'
): Promise<File> {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('No 2d context');
  }

  const scaleX = image.naturalWidth / image.width;
  const scaleY = image.naturalHeight / image.height;

  // Set canvas size to the desired crop size
  const targetSize = 400; // Fixed size for avatar
  canvas.width = targetSize;
  canvas.height = targetSize;

  // Calculate actual crop dimensions
  const cropX = crop.x * scaleX;
  const cropY = crop.y * scaleY;
  const cropWidth = crop.width * scaleX;
  const cropHeight = crop.height * scaleY;

  // Draw the cropped image onto canvas
  ctx.drawImage(
    image,
    cropX,
    cropY,
    cropWidth,
    cropHeight,
    0,
    0,
    targetSize,
    targetSize
  );

  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        throw new Error('Canvas is empty');
      }
      const file = new File([blob], fileName, {
        type: 'image/jpeg',
        lastModified: Date.now(),
      });
      resolve(file);
    }, 'image/jpeg', 0.9);
  });
}

export default function ImageCropper({
  src,
  onCropComplete,
  onCancel,
  isLoading = false
}: ImageCropperProps) {
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const imgRef = useRef<HTMLImageElement>(null);
  const aspect = 1; // 1:1 aspect ratio for avatar

  // Initialize crop when image loads
  function onImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
    const { width, height } = e.currentTarget;
    setCrop(centerAspectCrop(width, height, aspect));
  }

  // Handle crop completion
  const handleCropComplete = async () => {
    if (completedCrop && imgRef.current) {
      try {
        const croppedImageFile = await getCroppedImg(
          imgRef.current,
          completedCrop,
          'avatar.jpg'
        );
        onCropComplete(croppedImageFile);
      } catch (error) {
        console.error('Error cropping image:', error);
      }
    }
  };

  // Reset crop to center
  const resetCrop = () => {
    if (imgRef.current) {
      const { width, height } = imgRef.current;
      setCrop(centerAspectCrop(width, height, aspect));
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Crop Your Profile Picture
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Adjust the crop area to fit your profile picture perfectly
          </p>
        </div>

        {/* Crop Area */}
        <div className="p-6 max-h-[60vh] overflow-auto">
          <div className="flex justify-center">
            <ReactCrop
              crop={crop}
              onChange={(_, percentCrop) => setCrop(percentCrop)}
              onComplete={(c) => setCompletedCrop(c)}
              aspect={aspect}
              minWidth={100}
              minHeight={100}
              circularCrop={true}
              className="max-w-full"
            >
              <img
                ref={imgRef}
                alt="Crop preview"
                src={src}
                onLoad={onImageLoad}
                className="max-w-full max-h-[50vh] object-contain"
                style={{ maxWidth: '100%' }}
              />
            </ReactCrop>
          </div>
        </div>

        {/* Actions */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-between items-center">
          <Button
            variant="outline"
            onClick={resetCrop}
            className="flex items-center gap-2"
            disabled={isLoading}
          >
            <RotateCcw className="w-4 h-4" />
            Reset Crop
          </Button>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={onCancel}
              disabled={isLoading}
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button
              onClick={handleCropComplete}
              disabled={!completedCrop || isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Apply Crop
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Tips */}
        <div className="px-6 py-3 bg-blue-50 border-t border-blue-100">
          <p className="text-xs text-blue-700">
            💡 Tip: Drag the corners to resize the crop area. The final image will be 400x400 pixels.
          </p>
        </div>
      </div>
    </div>
  );
}