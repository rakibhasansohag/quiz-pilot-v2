import CountUpPage from '@/components/CountUpPage';
import Footer from '@/components/Footer';
import HeroSection from '@/components/HeroSection';
import Marquee from '@/components/Marquee';
import Navbar from '@/components/Navbar';

export default async function Home({ children }) {
  return (
    <div>
      <Navbar></Navbar>

      <main className="min-h-screen">
        <main className="space-y-32">
          <HeroSection />
          <CountUpPage />
          <Marquee />
        </main>
      </main>
      <footer>
        <Footer></Footer>
      </footer>
    </div>
  );
}
