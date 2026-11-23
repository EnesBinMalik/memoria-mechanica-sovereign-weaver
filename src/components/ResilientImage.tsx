import React, { useState } from 'react';
import { Compass } from 'lucide-react';

interface ResilientImageProps {
  src?: string;
  alt: string;
  className?: string;
  fallbackTitle: string;
}

export const ResilientImage: React.FC<ResilientImageProps> = ({
  src,
  alt,
  className = '',
  fallbackTitle,
}) => {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-[#14161B] border border-white/10 text-center p-8 ${className}`}
        role="img"
        aria-label={alt}
      >
        <Compass className="h-8 w-8 text-[#D4A843]/70 mb-3" />
        <p className="font-display text-lg text-[#F2EFE9]">{fallbackTitle}</p>
        <p className="mt-1 text-xs text-[#9E9A92]">Arşiv Görsel Plakası</p>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className={className}
    />
  );
};
