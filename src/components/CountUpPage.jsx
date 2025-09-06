'use client';

import React from 'react';
import CountUp from 'react-countup';

export default function CountUpPage() {
  return (
    <div className="col-span-1 flex flex-col gap-5 max-w-4xl mx-auto py-10 px-4">
      {/* Title */}
      <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-center text-gray-800 mb-2">
        Our Achievements
      </h1>

      {/* Description */}
      <p className="text-center text-gray-500 text-base sm:text-lg mb-8 max-w-xl mx-auto">
        We are proud of our growing community and the milestones we have
        achieved together. Here are some key stats:
      </p>

      {/* CountUp Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Total Users */}
        <div className="rounded-xl p-6 md:p-10 bg-gray-200 shadow-lg hover:shadow-xl transition-all">
          <h2 className="text-4xl text-black text-center font-bold">
            <CountUp start={0} end={10} duration={2} />+
          </h2>
          <h4 className="text-gray-800 text-center text-lg mt-3">
            Total Users
          </h4>
        </div>

        {/* Total Quiz */}
        <div className="rounded-xl p-6 md:p-10 bg-gray-200 shadow-lg hover:shadow-xl transition-all">
          <h2 className="text-4xl text-black text-center font-bold">
            <CountUp start={0} end={20} duration={2.5} />+
          </h2>
          <h4 className="text-gray-800 text-center text-lg mt-3">Total Quiz</h4>
        </div>

        {/* Total Categories */}
        <div className="rounded-xl p-6 md:p-10 bg-gray-200 shadow-lg hover:shadow-xl transition-all">
          <h2 className="text-4xl text-black text-center font-bold">
            <CountUp start={0} end={14} duration={2} />+
          </h2>
          <h4 className="text-gray-800 text-center text-lg mt-3">
            Total Categories
          </h4>
        </div>
      </div>
    </div>
  );
}
