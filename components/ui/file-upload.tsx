import { useState } from "react";
import { UploadCloud, Trash2 } from "lucide-react";
import Image from "next/image";
import { FileUploadProps } from "@/types";


const FileUpload: React.FC<FileUploadProps> = ({ onFilesSelected }) => {
  const [images, setImages] = useState<File[]>([]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newFiles = Array.from(files);
      setImages([...images, ...newFiles]);
      onFilesSelected(newFiles);
    }
  };

  const removeImage = (index: number) => {
    const updatedImages = images.filter((_, i) => i !== index);
    setImages(updatedImages);
    onFilesSelected(updatedImages);
  };

  return (
    <div className="border p-4 rounded-md">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Upload Photos/Videos
      </label>
      <input type="file" multiple accept="image/*,video/*" onChange={handleImageUpload} className="hidden" id="fileUpload" />
      <label htmlFor="fileUpload" className="flex items-center justify-center border-dashed border-2 border-gray-300 p-4 rounded-md cursor-pointer hover:bg-gray-100">
        <UploadCloud className="h-6 w-6 text-gray-500 mr-2" />
        <span className="text-sm text-gray-500">Drag & drop or click to upload</span>
      </label>

      {images.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {images.map((image, index) => (
            <div key={index} className="relative">
              <Image src={URL.createObjectURL(image)} alt="Uploaded Image" width={80} height={80} className="rounded-md" />
              <button onClick={() => removeImage(index)} className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1">
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FileUpload;
