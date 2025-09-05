'use client';

import { cn } from '@/lib/utils';
import Link from 'next/link';
import React from 'react';
import ReactHtmlParser from 'html-react-parser';

const Text = ({ tag, text, className, href = '#', ...rest }) => {
  const getTag = tag => {
    switch (tag) {
      case 'h1':
        return (
          <h1
            className={cn(
              'font-bold text-foreground capitalize text-3xl sm:text-4xl lg:text-5xl',
              className
            )}
            {...rest}
          >
            {ReactHtmlParser(text || '')}
          </h1>
        );
      case 'heading':
        return (
          <h2
            className={cn(
              'font-semibold text-primary capitalize text-2xl sm:text-3xl lg:text-4xl',
              className,
            )}
            {...rest}
          >
            {ReactHtmlParser(text || '')}
          </h2>
        );
      case 'small':
        return (
          <span
            className={cn('block text-sm pl-1 leading-6 text-muted-foreground', className)}
            {...rest}
          >
            {ReactHtmlParser(text || '')}
          </span>
        );
      case 'subheading':
        return (
          <p
            className={cn(
              'text-base font-semibold text-foreground',
              className
            )}
            {...rest}
          >
            {ReactHtmlParser(text || '')}
          </p>
        );
      case 'link':
        return (
          <Link
            href={href}
            className={cn(
              'block text-primary hover:text-secondary-foreground transition-all duration-300 ease-linear leading-9 text-base font-normal capitalize',
              className
            )}
          >
            {ReactHtmlParser(text || '')}
          </Link>
        );
      case 'paragraph':
      default:
        return (
          <p className={cn('text-base text-foreground', className)} {...rest}>
            {ReactHtmlParser(text || '')}
          </p>
        );
    }
  };

  return getTag(tag || 'paragraph');
};

export default Text;
