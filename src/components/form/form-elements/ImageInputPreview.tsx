import { Dispatch, SetStateAction } from "react";
import { XMarkIcon, PhotoIcon } from "@heroicons/react/24/outline";

export interface FileWithPreview {
  file: File | null;
  preview: string;
  isCover: boolean;
}

interface ImageUploaderProps {
  files: (FileWithPreview | null)[];
  onFileChange: Dispatch<SetStateAction<(FileWithPreview | null)[]>>;
}

export default function ImageUploader({
  files,
  onFileChange,
}: ImageUploaderProps) {
  // Handle upload gambar
  const handleFileUpload =
    (index: number) => (e: React.ChangeEvent<HTMLInputElement>) => {
      const newFile = e.target.files?.[0];
      if (!newFile) return;

      const fileWithPreview: FileWithPreview = {
        file: newFile,
        preview: URL.createObjectURL(newFile),
        isCover: files.every((file) => file === null), // Set cover otomatis jika ini gambar pertama
      };

      onFileChange((prevFiles) => {
        const newFiles = [...prevFiles];
        newFiles[index] = fileWithPreview;
        return newFiles;
      });
    };

  // Handle set cover
  const handleSetCover = (index: number) => {
    onFileChange((prevFiles) =>
      prevFiles.map((file, i) =>
        file ? { ...file, isCover: i === index } : null
      )
    );
  };

  // Handle hapus gambar
  const handleRemoveFile = (index: number) => {
    onFileChange((prevFiles) => {
      const newFiles = [...prevFiles];
      newFiles[index] = null; // Kosongkan slot, tidak menggeser urutan

      // Jika cover yang dihapus, set cover ke gambar pertama yang tersisa
      if (prevFiles[index]?.isCover) {
        const firstAvailableIndex = newFiles.findIndex((f) => f !== null);
        if (firstAvailableIndex !== -1 && newFiles[firstAvailableIndex]) {
          newFiles[firstAvailableIndex]!.isCover = true;
        }
      }
      return newFiles;
    });
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700">
        Upload Gambar Produk (5 gambar)
      </label>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 justify-center">
        {files.map((file, index) => (
          <div
            key={index}
            className="relative w-32 h-32 border-2 border-dashed rounded-lg overflow-hidden
      border-gray-200 dark:border-gray-700 transition-all hover:border-blue-500"
          >
            <input
              type="file"
              id={`file-upload-${index}`}
              className="hidden"
              accept="image/*"
              capture="environment"
              onChange={handleFileUpload(index)}
            />

            {file ? (
              <div className="relative w-full h-full">
                <img
                  src={file.preview}
                  alt="Preview"
                  className="w-full h-full object-cover cursor-pointer"
                  onClick={() => handleSetCover(index)}
                />
                {file.isCover && (
                  <div className="absolute top-1 left-1 bg-blue-500 text-white px-2 py-1 rounded text-xs font-medium">
                    Cover
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => handleRemoveFile(index)}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full
            w-6 h-6 flex items-center justify-center hover:bg-red-600"
                >
                  <XMarkIcon className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <label
                htmlFor={`file-upload-${index}`}
                className="w-full h-full flex flex-col items-center justify-center cursor-pointer
          hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-gray-400"
              >
                <PhotoIcon className="w-8 h-8 mb-1" />
                <span className="text-xs">Ambil Foto</span>
              </label>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
