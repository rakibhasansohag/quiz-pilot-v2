'use client';

import React from 'react';
import Link from 'next/link';
import Text from './shared/Typography/Text';
import ResponsiveWidthProvider from './shared/ResponsiveWidthProvider/ResponsiveWidthProvider';
import Image from 'next/image';

import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';


const team = [
  {
    name: "Rifat",
    img: "https://avatars.githubusercontent.com/u/168931799?v=4",
    portfolio: "https://ibrahimrifatpro.web.app/",
  },
  {
    name: "Rayhan",
    img: "https://avatars.githubusercontent.com/u/193317657?v=4",
    portfolio: "https://rayhab-portfolio.vercel.app/",
  },
  {
    name: "Rakib",
    img: "https://avatars.githubusercontent.com/u/93311114?v=4",
    portfolio: "https://rakibhasansohag-v2.vercel.app",
  },
  {
    name: "Sufian",
    img: "https://avatars.githubusercontent.com/u/120025447?v=4",
    portfolio: "https://abusufian.tech/",
  },
  {
    name: "Shahabb",
    img: "https://avatars.githubusercontent.com/u/193158321?v=4",
    portfolio: "https://ammar-shahahb-porfolio.vercel.app/",
  },
  {
    name: "Robiul",
    img: "https://avatars.githubusercontent.com/u/120470748?v=4",
    portfolio: "http://robiul-mern-portfolio.vercel.app/",
  },
];


export default function Footer() {
  return (
    <ResponsiveWidthProvider>
      <footer className="py-14">
        <div className="max-w-7xl mx-auto py-10 grid grid-cols-1 md:grid-cols-5 gap-8">

          {/* Left side */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
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
            </div>
            <p className="text-sm text-gray-600 mb-4">
              QuizPilot is a cutting-edge EdTech platform built with Next.js and NextAuth, designed to make learning programming languages fun, interactive, and accessible for everyone. We're passionate about transforming traditional education into an engaging experience where learners take the pilot's seat.
            </p>

            {/* Social icons */}
            {/* <div className="flex gap-4 text-gray-500">
              <a href="#" className="hover:text-blue-600"><FaFacebookF size={20} /></a>
              <a href="#" className="hover:text-sky-500"><FaTwitter size={20} /></a>
              <a href="#" className="hover:text-pink-500"><FaInstagram size={20} /></a>
              <a href="#" className="hover:text-blue-700"><FaLinkedinIn size={20} /></a>
            </div> */}
          </div>

          {/* Right side links */}

          {/* About Us */}
          <div>
            <h3 className="font-semibold mb-3">About Us</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className='hover:text-blue-700 hover:underline'><a href="/general-terms">Generel Terms</a></li>
              <li className='hover:text-blue-700 hover:underline'><a href="/intelectual">Intellectual Property and Usage Rights</a></li>
              <li className='hover:text-blue-700 hover:underline'><a href="/privacy">Action Policy</a></li>
            </ul>
          </div>
          {/* Terms & Conditions  */}
          <div>
            <h3 className="font-semibold mb-3">Terms & Conditions</h3>
            <ul className="space-y-2 text-sm text-gray-600 ">
              <li className='hover:text-blue-700 hover:underline'><a href="/terms-and-conditions">Conditions</a></li>
              <li className='hover:text-blue-700 hover:underline'><a href="/privacy-policy">Privacy Policy</a></li>
              <li className='hover:text-blue-700 hover:underline'><a href="/refund-policy">Refund Policy</a></li>
              <li className='hover:text-blue-700 hover:underline'><a href="/cookie-policy">Cookie Policy</a></li>

            </ul>
          </div>
          {/* Customer */}
          <div>
            <h3 className="font-semibold mb-3">Developed By </h3>
            <ul className="space-y-2 text-sm text-gray-600">
              {/* Avatars Row */}
              <li className="flex flex-wrap gap-1">
                <TooltipProvider>
                  {team.map((member) => (
                    <Tooltip key={member.name}>
                      <TooltipTrigger asChild>
                        <Link
                          href={member.portfolio}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Avatar className="cursor-pointer hover:scale-110 transition-transform">
                            <AvatarImage src={member.img} alt={member.name} />
                            <AvatarFallback>
                              {member.name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                        </Link>
                      </TooltipTrigger>
                      <TooltipContent side="bottom">
                        <p>{member.name}</p>
                      </TooltipContent>
                    </Tooltip>
                  ))}
                </TooltipProvider>
              </li>

            </ul>
          </div>
        </div>
        {/* Bottom */}
        <div className="mt-10 text-center text-gray-700 text-sm opacity-80">
          © {new Date().getFullYear()} QuizPilot. All rights reserved.
        </div>
      </footer>
    </ResponsiveWidthProvider>
  );
}
