import React from 'react';

/**
 * Midwan (مِدْوان) logo mark: the letter Meem drawn as a pen stroke, with an ink
 * dot at the centre of its loop. Colours are fixed so the mark reads the same in
 * light and dark themes; the same drawing is used for the favicon.
 */
export const BrandMark: React.FC<{ size?: number; className?: string; title?: string }> = ({ size = 36, className, title }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 60 60"
    className={className}
    role={title ? 'img' : undefined}
    aria-label={title}
    aria-hidden={title ? undefined : true}
  >
    <rect width="60" height="60" rx="15" fill="#8E1B2E" />
    <circle cx="38" cy="25" r="8" fill="none" stroke="#fff" strokeWidth="5" />
    <path d="M30 28 H19 V45" fill="none" stroke="#fff" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="38" cy="25" r="2.5" fill="#F3C9A0" />
  </svg>
);

/** The name set in the display face, for places that show the wordmark. */
export const BRAND = { ar: 'مِدْوان', en: 'Midwan', taglineAr: 'سجل التدريب التعاوني', taglineEn: 'Co-op training log' } as const;
