"use client"

import loginAnimation from '@/components/loginAnimation.json';
import Lottie from 'lottie-react';

const LoginLottie = () => {
    return (

        <Lottie animationData={loginAnimation} className='mx-auto w-8/10 lg:w-fit'/>

    );
};

export default LoginLottie;