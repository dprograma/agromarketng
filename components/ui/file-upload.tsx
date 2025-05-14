import { useState, useEffect } from "react";
import { UploadCloud, Trash2, AlertCircle, Info } from "lucide-react";
import Image from "next/image";
import { FileUploadProps } from "@/types";
import { motion, AnimatePresence } from "framer-motion";

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
const ALLOWED_FILE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

const FileUpload: React.FC<FileUploadProps> = ({ onFilesSelected, maxFiles = 5, error }) => {
  const [images, setImages] = useState<File[]>([]);
  const [fileErrors, setFileErrors] = useState<string[]>([]);
  const [dragActive, setDragActive] = useState(false);

  // Reset errors when component unmounts
  useEffect(() => {
    return () => {
      setFileErrors([]);
    };
  }, []);

  const validateFile = (file: File): string | null => {
    // Check file type
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      return `${file.name} is not a supported image format. Please use JPG, PNG, WebP, or GIF.`;
    }

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      return `${file.name} exceeds the 2MB size limit.`;
    }

    // Check for duplicate files by name and size
    const isDuplicate = images.some(
      existingFile =>
        existingFile.name === file.name &&
        existingFile.size === file.size
    );

    if (isDuplicate) {
      return `${file.name} has already been added.`;
    }

    return null;
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    processFiles(Array.from(files));

    // Reset the input value to allow uploading the same file again if it was removed
    e.target.value = '';
  };

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(Array.from(e.dataTransfer.files));
    }
  };

  const processFiles = (newFiles: File[]) => {
    // Reset errors
    setFileErrors([]);

    // Validate each file
    const errors: string[] = [];
    const validFiles: File[] = [];

    newFiles.forEach(file => {
      const error = validateFile(file);
      if (error) {
        errors.push(error);
      } else {
        validFiles.push(file);
      }
    });

    // Check if adding these files would exceed the maximum
    if (images.length + validFiles.length > maxFiles) {
      errors.push(`You can only upload a maximum of ${maxFiles} images.`);
      // Only add files up to the limit
      validFiles.splice(maxFiles - images.length);
    }

    // Update errors state
    if (errors.length > 0) {
      setFileErrors(errors);
    }

    // Update images state if there are valid files
    if (validFiles.length > 0) {
      const updatedImages = [...images, ...validFiles];
      setImages(updatedImages);
      onFilesSelected(updatedImages);
    }
  };

  const removeImage = (index: number) => {
    const updatedImages = images.filter((_, i) => i !== index);
    setImages(updatedImages);
    onFilesSelected(updatedImages);
  };

  return (
    <div className="space-y-2">
      <div
        className={`border-2 ${dragActive ? 'border-green-500 bg-green-50' : 'border-dashed border-gray-300'}
                   ${error ? 'border-red-300' : ''}
                   rounded-lg transition-all duration-200 overflow-hidden`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <label className="block text-sm font-medium text-gray-700 px-4 pt-4">
          Upload Images (Max {maxFiles})
        </label>

        <input
          type="file"
          multiple
          accept={ALLOWED_FILE_TYPES.join(',')}
          onChange={handleImageUpload}
          className="hidden"
          id="fileUpload"
        />

        <label
          htmlFor="fileUpload"
          className="flex flex-col items-center justify-center p-6 cursor-pointer hover:bg-gray-50 transition-colors"
        >
          <div className={`p-3 rounded-full ${dragActive ? 'bg-green-100' : 'bg-gray-100'} mb-3`}>
            <UploadCloud className={`h-6 w-6 ${dragActive ? 'text-green-500' : 'text-gray-500'}`} />
          </div>
          <p className="text-sm font-medium text-gray-700">Drag & drop your images here</p>
          <p className="text-xs text-gray-500 mt-1">or click to browse</p>
          <p className="text-xs text-gray-400 mt-3">JPG, PNG, WebP, GIF • Max 2MB per image</p>
        </label>
      </div>

      {/* Error messages */}
      <AnimatePresence>
        {(fileErrors.length > 0 || error) && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-red-50 border border-red-200 rounded-md p-3 overflow-hidden"
          >
            <div className="flex items-start">
              <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 mr-2 flex-shrink-0" />
              <div className="space-y-1">
                {error && <p className="text-sm text-red-600">{error}</p>}
                {fileErrors.map((err, i) => (
                  <p key={i} className="text-sm text-red-600">{err}</p>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Image preview */}
      <AnimatePresence>
        {images.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mt-3"
          >
            {images.map((image, index) => (
              <motion.div
                key={`${image.name}-${index}`}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="relative group rounded-lg overflow-hidden border border-gray-200"
              >
                <div className="aspect-square relative">
                  <Image
                    src={URL.createObjectURL(image)}
                    alt={`Preview ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center">
                  <button
                    onClick={() => removeImage(index)}
                    className="bg-red-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-200"
                    aria-label="Remove image"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs px-2 py-1 truncate">
                  {image.name}
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Help text */}
      {images.length === 0 && (
        <div className="flex items-start text-xs text-gray-500 mt-2">
          <Info className="h-4 w-4 mr-1 flex-shrink-0" />
          <span>Add high-quality images to make your ad stand out. First image will be used as the main image.</span>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
