'use client';

import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Images } from 'lucide-react';
import { absoluteUrl } from '@/lib/api';

export type PhotoLike = { url: string; alt?: string | null };

export interface PropertyWithPhotos {
  title?: string;
  photos?: string | null;
  photoItems?: PhotoLike[] | null;
}

export function getPropertyPhotos(property: PropertyWithPhotos): string[] {
  const related = Array.isArray(property.photoItems)
    ? property.photoItems.map((photo) => photo.url).filter(Boolean)
    : [];

  const raw = related.length > 0
    ? related
    : String(property.photos || '')
        .split(',')
        .map((photo) => photo.trim())
        .filter(Boolean);

  return raw.map(absoluteUrl);
}

interface PropertyImageCarouselProps {
  property: PropertyWithPhotos;
  className?: string;
  imageClassName?: string;
  showCounter?: boolean;
  enableHoverZoom?: boolean;
}

export default function PropertyImageCarousel({
  property,
  className = 'relative h-56 w-full overflow-hidden bg-black',
  imageClassName = 'w-full h-full object-cover transition-transform duration-500',
  showCounter = true,
  enableHoverZoom = true,
}: PropertyImageCarouselProps) {
  const photos = useMemo(() => getPropertyPhotos(property), [property]);
  const [index, setIndex] = useState(0);
  const title = property.title || 'Imovel';
  const hasMany = photos.length > 1;
  const src = photos[index] || '/luxury_mansion_front.png';

  const go = (direction: -1 | 1) => {
    if (!hasMany) return;
    setIndex((current) => (current + direction + photos.length) % photos.length);
  };

  return (
    <div className={`${className} group/gallery`}>
      <img
        src={src}
        alt={`${title} - foto ${index + 1}`}
        className={`${imageClassName} ${enableHoverZoom ? 'group-hover/gallery:scale-105' : ''}`}
      />

      {hasMany && (
        <>
          <button
            type="button"
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              go(-1);
            }}
            className="absolute left-3 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-black/65 text-white border border-white/20 flex items-center justify-center hover:bg-primary transition-colors"
            aria-label="Foto anterior"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              go(1);
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-black/65 text-white border border-white/20 flex items-center justify-center hover:bg-primary transition-colors"
            aria-label="Proxima foto"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </>
      )}

      {showCounter && photos.length > 0 && (
        <div className="absolute bottom-3 left-3 bg-black/75 text-white text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1.5">
          <Images className="h-3.5 w-3.5" />
          {index + 1}/{photos.length}
        </div>
      )}
    </div>
  );
}