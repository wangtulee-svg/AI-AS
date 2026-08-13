// frontend/src/components/LoadingSpinner.jsx

import { Loader2 } from 'lucide-react';

export const LoadingSpinner = ({ size = 'md', fullScreen = false }) => {
  const sizes = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16',
  };

  const content = (
    <div className="flex flex-col items-center justify-center gap-2">
      <Loader2 className={`${sizes[size]} animate-spin text-blue-500`} />
      <p className="text-sm text-gray-500">Loading...</p>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        {content}
      </div>
    );
  }

  return content;
};