import React from "react";
import Lottie from "lottie-react";
import Link from "next/link";
import animationData from "/Page Not Found 404.json";

export default function Error404({ loop = true }) {
  return (
    <div className="flex flex-col items-center min-h-screen px-4">
      {/* Lottie Animation */}
      <div className="w-64 h-fit md:w-[550px]">
        <Lottie animationData={animationData} loop={loop} />
      </div>

      {/* Back to Home Button */}

      <Link
        href="/"
        className="inline-flex items-center gap-2 rounded-md bg-primary 
             px-4 py-2 text-sm 
             sm:px-5 sm:py-2.5 sm:text-base 
             md:px-6 md:py-3 md:text-lg 
             text-white font-semibold shadow 
             hover:bg-purple-950/90 transition mt-4"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          viewBox="0 0 24 24"
        >
          <path d="M15 19l-7-7 7-7" />
        </svg>
        Back to Home
      </Link>
    </div>
  );
}
