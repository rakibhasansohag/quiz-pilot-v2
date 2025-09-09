import Footer from '@/components/Footer';
import Navbar from '@/components/Navbar';
import Chatbot from '@/components/chatbot/chatbot';

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

            {/* chat Button */}
            <Chatbot/>
        </div>
    );
};

export default HomeLayout;