import CountUpPage from '@/components/CountUpPage';
import Footer from '@/components/Footer';
import HeroSection from '@/components/HeroSection';
import Marquee from '@/components/Marquee';
import Navbar from '@/components/Navbar';
import ResponsiveWidthProvider from '@/components/shared/ResponsiveWidthProvider/ResponsiveWidthProvider';

export default async function Home() {
  return (
    <>
      <nav>
        <Navbar />
      </nav>
      <ResponsiveWidthProvider>
        <main className="space-y-32 pt-20">
          <HeroSection />
          <CountUpPage />
          <Marquee />
        </main>
      </ResponsiveWidthProvider>
      <footer className="mt-32">
        <Footer />
      </footer>
    </>
  );
}
