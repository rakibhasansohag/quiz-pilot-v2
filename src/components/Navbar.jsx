"use client";

<<<<<<< HEAD
import Link from "next/link";
import Image from "next/image";
import { signOut, useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import ThemeToggle from "./ThemeToggle";
import ResponsiveWidthProvider from "./shared/ResponsiveWidthProvider/ResponsiveWidthProvider";
import { useEffect, useState } from "react";
=======
import Link from 'next/link';
import Image from 'next/image';
import { useSession, signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import ThemeToggle from './ThemeToggle';
import ResponsiveWidthProvider from './shared/ResponsiveWidthProvider/ResponsiveWidthProvider';
import Text from './shared/Typography/Text';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';
<<<<<<< HEAD
>>>>>>> 4ee0a75 (fixed navbar responsiveness issue)
=======
>>>>>>> 68087f558807760fa2d070ba199779435babd427

export default function Navbar() {
  const { data: session, status } = useSession();
  const user = session?.user;

  const routes = [
<<<<<<< HEAD
<<<<<<< HEAD
    { name: "Home", href: "/", auth: user },
    { name: "Categories", href: "/categories", auth: user },
    { name: "Questions", href: "/questions", auth: user },
    { name: "Dashboard", href: "/dashboard", auth: user },
  ];

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
=======
    { name: 'Home', href: '/' },
    { name: 'Categories', href: '/categories' },
    { name: 'Questions', href: '/questions' },
    { name: 'Dashboard', href: '/dashboard' },
  ];

  const [isMenuOpen, setIsMenuOpen] = useState(false);
>>>>>>> 4ee0a75 (fixed navbar responsiveness issue)
=======
    { name: 'Home', href: '/' },
    { name: 'Categories', href: '/categories' },
    { name: 'Quiz', href: '/quiz' },
    { name: 'Dashboard', href: '/dashboard' },
  ];

  const [isMenuOpen, setIsMenuOpen] = useState(false);
>>>>>>> 68087f558807760fa2d070ba199779435babd427

  return (
    <nav
      className={cn(
<<<<<<< HEAD
        'fixed w-full py-2 z-40 transition-all duration-300 border-b backdrop-blur-2xl border-gray-300 dark:border-gray-700'
=======
        'sticky top-0 z-50 w-full py-2 transition-all duration-300 border-b backdrop-blur-2xl border-gray-300 dark:border-gray-700'
>>>>>>> 68087f558807760fa2d070ba199779435babd427
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
            {routes.map((route) => (
              <li key={route.href}>
                <Text href={route.href} tag="link" text={route.name} />
              </li>
            ))}
          </ul>

          {/* Right Section */}
          <div className="flex items-center gap-3">
            <ThemeToggle />

<<<<<<< HEAD
<<<<<<< HEAD
            {status === "loading" ? null : session ? (
              <>
                <Link href="/dashboard/add-product">
                  <Button>Add</Button>
                </Link>

                <div className="flex items-center gap-2">
                  {session.user?.image && (
                    <Image
                      src={session.user.image}
                      alt={session.user?.name || "avatar"}
                      width={36}
                      height={36}
                      className="rounded-full"
                    />
                  )}
                  <span className="hidden sm:inline-block text-sm">
                    {session.user?.name}
                  </span>
                </div>

                <Button onClick={() => signOut({ callbackUrl: "/" })}>
=======
            {status === 'loading' ? null : user ? (
              <>
=======
            {status === 'loading' ? null : user ? (
              <>
>>>>>>> 68087f558807760fa2d070ba199779435babd427
                {user.image && (
                  <Image
                    src={user.image}
                    alt={user.name || 'User Avatar'}
                    width={36}
                    height={36}
                    className="rounded-full"
                  />
                )}
                <Button size="sm" onClick={() => signOut({ callbackUrl: '/' })}>
<<<<<<< HEAD
>>>>>>> 4ee0a75 (fixed navbar responsiveness issue)
=======
>>>>>>> 68087f558807760fa2d070ba199779435babd427
                  Sign out
                </Button>
              </>
            ) : (
              <Link className='hidden md:block' href="/login">
                <Button size="sm" className="bg-primary cursor-pointer text-white">
                  Login
                </Button>
              </Link>
            )}

            {/* Mobile Hamburger */}
            <button
              className="md:hidden p-2 text-foreground z-50 cursor-pointer"
              onClick={() => setIsMenuOpen((prev) => !prev)}
              aria-label={isMenuOpen ? 'Close Menu' : 'Open Menu'}
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {/* Mobile Menu */}
          <div
            className={cn(
              'fixed inset-0 min-h-screen bg-[#d9e0e8]/95 dark:bg-[#131518]/95 z-40 flex flex-col items-center justify-center transition-all duration-300 md:hidden',
              isMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
            )}
          >
            <div className="flex flex-col space-y-8 text-xl">
              {routes.map((route) => (
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
                  <Button size="sm" className="bg-primary cursor-pointer text-white">
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