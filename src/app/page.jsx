<<<<<<< HEAD
import CountUpPage from "@/components/CountUpPage";
import Footer from "@/components/Footer";
import HeroSection from "@/components/HeroSection";
import Marquee from "@/components/Marquee";
import Navbar from "@/components/Navbar";
import ResponsiveWidthProvider from "@/components/shared/ResponsiveWidthProvider/ResponsiveWidthProvider";
import Text from "@/components/shared/Typography/Text";
=======
import CountUpPage from '@/components/CountUpPage';
import Footer from '@/components/Footer';
import HeroSection from '@/components/HeroSection';
import Marquee from '@/components/Marquee';
import Navbar from '@/components/Navbar';
>>>>>>> 68087f558807760fa2d070ba199779435babd427

export default async function Home({ children }) {
  return (
    <div>
<<<<<<< HEAD
      <nav>
        <Navbar />
      </nav>
      <ResponsiveWidthProvider>
        <main className="space-y-32 pt-20">
=======
      <Navbar></Navbar>

      <main className="min-h-screen">
        <main className="space-y-32">
>>>>>>> 68087f558807760fa2d070ba199779435babd427
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
