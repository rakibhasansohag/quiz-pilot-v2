'use client';

import React from 'react';
import Link from 'next/link';
import Text from './shared/Typography/Text';
import ResponsiveWidthProvider from './shared/ResponsiveWidthProvider/ResponsiveWidthProvider';

const footerLinks = {
  about: [
    { label: 'Courses', href: '#' },
    { label: 'Mission', href: '#' },
    { label: 'Approach', href: '#' },
    { label: 'Efficacy', href: '#' },
    { label: 'QuizPilot Handbook', href: '#' },
    { label: 'Research', href: '#' },
    { label: 'Careers', href: '#' },
    { label: 'Brand guidelines', href: '#' },
    { label: 'Store', href: '#' },
    { label: 'Press', href: '#' },
    { label: 'Investors', href: '#' },
    { label: 'Contact us', href: '#' },
  ],
  products: [
    { label: 'QuizPilot', href: '#' },
    { label: 'QuizPilot for Schools', href: '#' },
    { label: 'QuizPilot Test', href: '#' },
    { label: 'QuizPilot Math', href: '#' },
    { label: 'Podcast', href: '#' },
    { label: 'QuizPilot for Business', href: '#' },
    { label: 'Super QuizPilot', href: '#' },
    { label: 'Gift Super QuizPilot', href: '#' },
    { label: 'QuizPilot Max', href: '#' },
  ],
  apps: [
    { label: 'QuizPilot for Android', href: '#' },
    { label: 'QuizPilot for iOS', href: '#' },
  ],
  support: [
    { label: 'QuizPilot FAQs', href: '#' },
    { label: 'Schools FAQs', href: '#' },
    { label: 'QuizPilot Test FAQs', href: '#' },
    { label: 'Status', href: '#' },
  ],
  privacy: [
    { label: 'Community guidelines', href: '#' },
    { label: 'Terms', href: '#' },
    { label: 'Privacy', href: '#' },
    { label: 'Do Not Sell or Share My Personal Info', href: '#' },
  ],
  social: [
    { label: 'Blog', href: '#' },
    { label: 'Instagram', href: '#' },
    { label: 'TikTok', href: '#' },
    { label: 'Twitter', href: '#' },
    { label: 'YouTube', href: '#' },
  ],
};

export default function Footer() {
  return (
    <ResponsiveWidthProvider>
      <footer className=" py-14">
        <div className="max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-10">
          {/* About Us */}
          <div>
            <Text tag="h2" text="About us" className="font-bold mb-4" />
            <ul className="space-y-2">
              {footerLinks.about.map((link, i) => (
                <li key={i}>
                  <Link
                    href={link.href}
                    className="hover:underline text-gray-700 transition-all duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Products */}
          <div>
            <Text tag="h2" text="Products" className="font-bold mb-4" />
            <ul className="space-y-2">
              {footerLinks.products.map((link, i) => (
                <li key={i}>
                  <Link
                    href={link.href}
                    className="hover:underline text-gray-700 transition-all duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Apps */}
          <div>
            <Text tag="h2" text="Apps" className="font-bold mb-4" />
            <ul className="space-y-2">
              {footerLinks.apps.map((link, i) => (
                <li key={i}>
                  <Link
                    href={link.href}
                    className="hover:underline text-gray-700 transition-all duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Help & Support */}
          <div>
            <Text tag="h2" text="Help and support" className="font-bold mb-4" />
            <ul className="space-y-2">
              {footerLinks.support.map((link, i) => (
                <li key={i}>
                  <Link
                    href={link.href}
                    className="hover:underline text-gray-700 transition-all duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Privacy */}
          <div>
            <Text
              tag="h2"
              text="Privacy and terms"
              className="font-bold mb-4"
            />
            <ul className="space-y-2">
              {footerLinks.privacy.map((link, i) => (
                <li key={i}>
                  <Link
                    href={link.href}
                    className="hover:underline text-gray-700 transition-all duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Social */}
          <div>
            <Text tag="h2" text="Social" className="font-bold mb-4" />
            <ul className="space-y-2">
              {footerLinks.social.map((link, i) => (
                <li key={i}>
                  <Link
                    href={link.href}
                    className="hover:underline text-gray-700 transition-all duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-10 text-center text-gray-700 text-sm opacity-80">
          © {new Date().getFullYear()} QuizPilot. All rights reserved.
        </div>
      </footer>
    </ResponsiveWidthProvider>
  );
}
