'use client';

import Link from 'next/link';
import Image from 'next/image';
import { signOut, useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import ThemeToggle from './ThemeToggle';
import ResponsiveWidthProvider from './shared/ResponsiveWidthProvider/ResponsiveWidthProvider';

export default function Navbar() {
  const { data: session, status } = useSession();
  const user = session?.user;

  const routes = [
    { name: 'Home', href: '/', auth: user },
    { name: 'Categories', href: '/categories', auth: user },
    { name: 'Questions', href: '/questions', auth: user },
    { name: 'Dashboard', href: '/dashboard', auth: user },
  ];

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className="bg-[#d9e0e8] dark:bg-[#131518] border-b-1 border-[#d9e0e8] dark:border-gray-600 shadow-sm">
      <ResponsiveWidthProvider>
        <div className="py-2 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="flex items-center gap-x-2 font-bold text-lg"
            >
              <Image
                src="https://res.cloudinary.com/dlrzwaoga/image/upload/v1757071182/vnixltocrqshrhu3l22t.png"
                alt="log"
                width={48} // equivalent to w-8
                height={48} // equivalent to h-8
                className="object-contain"
                priority // ensures logo loads instantly
              />
              <h1 tag="heading" text="hellooooo" className="">
                QuizPilot
              </h1>
            </Link>
          </div>

          <div className="flex items-center gap-3">
            {/* Theme toggle */}
            <ThemeToggle />
            <Link href="/Quizes" className="text-sm text-muted-foreground">
              Quizes
            </Link>

            {status === 'loading' ? null : session ? (
              <>
                <Link href="/dashboard/add-product">
                  <Button>Add</Button>
                </Link>

                <div className="flex items-center gap-2">
                  {session.user?.image && (
                    <Image
                      src={session.user.image}
                      alt={session.user?.name || 'avatar'}
                      width={36}
                      height={36}
                      className="rounded-full"
                    />
                  )}
                  <span className="hidden sm:inline-block text-sm">
                    {session.user?.name}
                  </span>
                </div>

                <Button onClick={() => signOut({ callbackUrl: '/' })}>
                  Sign out
                </Button>
              </>
            ) : (
              <Link href="/login"> Login </Link>
            )}
          </div>
        </div>
      </ResponsiveWidthProvider>
    </nav>
  );
}
