'use client';

import Image, { type ImageProps } from 'next/image';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface SafeImageProps extends Omit<ImageProps, 'src' | 'onError'> {
  src:       string;
  fallback?: string;
  alt:       string;
  className?: string;
}

export function SafeImage({
  src,
  fallback = '/logos/unknown.png',
  alt,
  className,
  sizes = '10vw',
  ...props
}: SafeImageProps) {
  const [imgSrc, setImgSrc]   = useState(src);
  const [errored, setErrored] = useState(false);

  // ── Sync when src prop changes (e.g. token switch) ───
  useEffect(() => {
    setImgSrc(src);
    setErrored(false); // reset error state so new src gets a fresh attempt
  }, [src]);

  const handleError = () => {
    if (!errored) {
      setErrored(true);
      setImgSrc(fallback);
    }
  };

  return (
    <Image
      {...props}
      src={imgSrc}
      alt={alt}
      className={cn('object-contain', className)}
      onError={handleError}
      unoptimized={imgSrc.startsWith('http')}
    />
  );
}