import { useEffect, useState } from "react";

export interface LoadingToastProps {
  message: string;
  isLoading: boolean;
}

export default function LoadingToast({
  message,
  isLoading,
}: LoadingToastProps) {
  const [visible, setVisible] = useState(isLoading);

  useEffect(() => {
    if (isLoading) {
      setVisible(true);
    } else {
      const timer = setTimeout(() => setVisible(false), 500);
      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  if (!visible) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 bg-gray-800 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2">
      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
      <span className="text-sm">{message}</span>
    </div>
  );
}
