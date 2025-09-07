import Footer from '@/components/Footer';
import Navbar from '@/components/Navbar';
import React from 'react';

const HomeLayout = ({ children }) => {
    return (
        <div>
            <nav>
                <Navbar></Navbar>
            </nav>
            <main className='min-h-screen'>
                {children}
            </main>
            <footer>
                <Footer></Footer>
            </footer>
        </div>
    );
};

export default HomeLayout;