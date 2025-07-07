import { ReactNode } from "react";

interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onClose?: () => void; // Dijadikan opsional
  onConfirm?: () => void; // Dijadikan opsional
  cancelButtonText?: ReactNode; // Teks untuk tombol batal/tutup
  confirmButtonText?: ReactNode; // Teks untuk tombol konfirmasi
  cancelButtonClassName?: string; // Class tambahan untuk tombol batal
  confirmButtonClassName?: string; // Class tambahan untuk tombol konfirmasi
}

export default function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  cancelButtonText = "Batal", // Nilai default
  confirmButtonText = "Ya, Konfirmasi", // Nilai default baru yang lebih generik
  cancelButtonClassName = "",
  confirmButtonClassName = "",
}: ConfirmationModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-100000000 flex items-center justify-center bg-black bg-opacity-50 transition-opacity">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md mx-4 transform transition-all">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
          {title}
        </h3>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-300 whitespace-pre-wrap">
          {message}
        </p>
        <div className="mt-6 flex justify-end space-x-3">
          {/* Tombol Batal/Tutup hanya muncul jika onClose diberikan */}
          {onClose && (
            <button
              onClick={onClose}
              className={`px-4 py-2 text-sm font-medium rounded-md focus:outline-none 
                bg-gray-100 text-gray-700 hover:bg-gray-200 
                dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 
                ${cancelButtonClassName}`}
            >
              {cancelButtonText}
            </button>
          )}

          {/* Tombol Konfirmasi hanya muncul jika onConfirm diberikan */}
          {onConfirm && (
            <button
              onClick={onConfirm}
              className={`px-4 py-2 text-sm font-medium text-white rounded-md focus:outline-none
                bg-red-600 hover:bg-red-700 focus:ring-2 focus:ring-offset-2 focus:ring-red-500
                ${confirmButtonClassName}`}
            >
              {confirmButtonText}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
