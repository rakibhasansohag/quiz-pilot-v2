import CountUpPage from '@/components/CountUpPage';
import HeroSection from '@/components/HeroSection';
import Marquee from '@/components/Marquee';
import ResponsiveWidthProvider from '@/components/shared/ResponsiveWidthProvider/ResponsiveWidthProvider';
import React from 'react';

const Home = () => {
    return (
        <ResponsiveWidthProvider>
            <main className="space-y-32 pt-20">
                <HeroSection />
                <CountUpPage />
                <Marquee />
            </main>
        </ResponsiveWidthProvider>
    );
};

export default Home;