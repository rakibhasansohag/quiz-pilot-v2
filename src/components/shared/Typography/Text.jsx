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
              'font-bold capitalize lg:text-3xl text-2xl',
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
							'font-bold capitalize sm:text-xl lg:text-3xl text-red-400',
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
            className={cn('text-sm pl-1 leading-6', className)}
            {...rest}
          >
            {ReactHtmlParser(text || '')}
          </span>
        );
      case 'terms':
        return (
          <span
            className={cn(
              'block text-base sm:text-lg w-[100%] lg:w-[70%] text-stone-950 leading-6',
              className
            )}
            {...rest}
          >
            {ReactHtmlParser(text || '')}
          </span>
        );
      case 'link':
        return (
          <Link
            href={href}
            className={cn(
              'text-white transition-all duration-300 ease-linear leading-9 text-base font-normal capitalize hover:text-[#2eca7f]',
              className
            )}
          >
            {ReactHtmlParser(text || '')}
          </Link>
        );
      case 'paragraph':
      default:
        return (
          <div className={cn('text-base', className)} {...rest}>
            {ReactHtmlParser(text || '')}
          </div>
        );
    }
  };

  return getTag(tag || 'paragraph');
};

export default Text;
