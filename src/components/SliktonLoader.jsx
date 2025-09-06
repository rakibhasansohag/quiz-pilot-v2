'use client';

import React from 'react';

export default function SliktonLoader({
  count = 6,
  variant = 'card',
  ariaLabel = 'Loading content',
}) {
  const items = Array.from({ length: count });

  // card layout classes (matches the question cards)
  const cardInner = (
    <>
      <div className="h-6 bg-gray-300 dark:bg-neutral-700 rounded-md w-3/4 mb-3 animate-pulse" />
      <div className="flex gap-2 mb-3">
        <div className="h-7 w-20 bg-gray-300 dark:bg-neutral-700 rounded-full animate-pulse" />
        <div className="h-7 w-14 bg-gray-300 dark:bg-neutral-700 rounded-full animate-pulse" />
        <div className="h-7 w-16 bg-gray-300 dark:bg-neutral-700 rounded-full animate-pulse" />
      </div>
      <div className="h-4 bg-gray-200 dark:bg-neutral-700 rounded-md w-1/3 animate-pulse" />
    </>
  );

  // compact/list layout classes (smaller)
  const compactInner = (
    <>
      <div className="h-5 bg-gray-300 dark:bg-neutral-700 rounded-md w-4/5 mb-2 animate-pulse" />
      <div className="h-3 bg-gray-300 dark:bg-neutral-700 rounded-md w-1/2 animate-pulse" />
    </>
  );

  return (
    <div role="status" aria-label={ariaLabel} className="w-full">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((_, idx) => (
          <div
            key={idx}
            className="rounded-xl border border-gray-100 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 shadow-sm"
            aria-hidden="true"
          >
            {variant === 'compact' ? compactInner : cardInner}

            {/* footer skeleton for action buttons */}
            <div className="mt-5 flex gap-3">
              <div className="h-9 w-24 bg-gray-200 dark:bg-neutral-700 rounded-md animate-pulse" />
              <div className="h-9 w-24 bg-gray-200 dark:bg-neutral-700 rounded-md animate-pulse" />
            </div>
          </div>
        ))}
      </div>

      {/* visually hidden text for screen-readers (announce loading) */}
      <span className="sr-only">Loading…</span>
    </div>
  );
}
