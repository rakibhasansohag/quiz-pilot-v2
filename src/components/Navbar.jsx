'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useSession, signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import ThemeToggle from './ThemeToggle';
import ResponsiveWidthProvider from './shared/ResponsiveWidthProvider/ResponsiveWidthProvider';
import UserMenu from '@/components/shared/Dropdowns/UserMenu';
import Text from './shared/Typography/Text';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Navbar() {
  const { data: session, status } = useSession();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const user = session?.user;

  const routes = [
    { name: 'Home', href: '/' },
    { name: 'Quiz', href: '/quiz' },
    { name: 'Dashboard', href: '/dashboard' },
  ];

  return (
    <nav
      className={cn(
        'sticky top-0 z-50 w-full py-2 transition-all duration-300 border-b backdrop-blur-2xl border-gray-300 dark:border-gray-700'
      )}
    >
      <ResponsiveWidthProvider>
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 font-bold text-lg">
            <Image
              src="https://res.cloudinary.com/dlrzwaoga/image/upload/v1757071182/vnixltocrqshrhu3l22t.png"
              alt="QuizPilot Logo"
              width={48}
              height={48}
              className="object-contain"
              priority
            />
            <span className="text-xl font-bold">QuizPilot</span>
          </Link>

          {/* Desktop Navigation */}
          <ul className="hidden md:flex items-center space-x-6">
            {routes.map(route => (
              <li key={route.href}>
                <Text href={route.href} tag="link" text={route.name} />
              </li>
            ))}
          </ul>

          {/* Right Section */}
          <div className="flex items-center gap-3">
            <ThemeToggle />

            {status === 'loading' ? null : <UserMenu />}

            {/* Mobile Hamburger */}
            <button
              className="md:hidden p-2 text-foreground z-50 cursor-pointer"
              onClick={() => setIsMenuOpen(prev => !prev)}
              aria-label={isMenuOpen ? 'Close Menu' : 'Open Menu'}
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {/* Mobile Menu */}
          <div
            className={cn(
              'fixed inset-0 min-h-screen bg-[#d9e0e8]/95 dark:bg-[#131518]/95 z-40 flex flex-col items-center justify-center transition-all duration-300 md:hidden',
              isMenuOpen
                ? 'opacity-100 pointer-events-auto'
                : 'opacity-0 pointer-events-none'
            )}
          >
            <div className="flex flex-col space-y-8 text-xl">
              {routes.map(route => (
                <Link
                  key={route.href}
                  href={route.href}
                  onClick={() => setIsMenuOpen(false)}
                  className="text-foreground/80 dark:text-gray-200 hover:text-primary transition-colors duration-300"
                >
                  {route.name}
                </Link>
              ))}

              {user ? (
                <Button
                  size="sm"
                  onClick={() => {
                    signOut({ callbackUrl: '/' });
                    setIsMenuOpen(false);
                  }}
                >
                  Sign out
                </Button>
              ) : (
                <Link href="/login" onClick={() => setIsMenuOpen(false)}>
                  <Button
                    size="sm"
                    className="bg-primary cursor-pointer text-white"
                  >
                    Login
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </ResponsiveWidthProvider>
    </nav>
  );
}
