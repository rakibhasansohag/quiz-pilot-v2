import Footer from '@/components/Footer';
import Navbar from '@/components/Navbar';
import React from 'react';

const HomeLayout = ({ children }) => {
    return (
        <div>

            <Navbar></Navbar>

            <main className=''>
                {children}
            </main>
            <footer>
                <Footer></Footer>
            </footer>
        </div>
    );
};

export default HomeLayout;