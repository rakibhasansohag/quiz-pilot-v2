'use client';

import React from 'react';
import CountUp from 'react-countup';
import Text from './shared/Typography/Text';

export default function CountUpPage() {
  return (
    <div className="col-span-1 flex flex-col gap-5 max-w-4xl mx-auto py-10 px-4">
      {/* Heading */}
      <Text
        tag="heading"
        text="Our Achievements"
        className="mb-4 text-center"
      />
      {/* Paragraph */}
      <Text
        tag="paragraph"
        text="We are proud of our growing community and the milestones we have
        achieved together. Here are some key stats:"
        className="mb-8 text-center"
      />

      {/* CountUp Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Total Users */}
        <div className="rounded-xl p-6 md:p-10 bg-purple-50/50 dark:bg-gray-500 text-black dark:text-gray-50 shadow-sm hover:shadow-md transition-all">
          <h2 className="text-4xl text-center font-bold">
            <CountUp start={0} end={10} duration={2} />+
          </h2>
          <h4 className="text-center text-lg mt-3">Total Users</h4>
        </div>

        {/* Total Quiz */}
        <div className="rounded-xl p-6 md:p-10 bg-purple-50/50 dark:bg-gray-500 text-black dark:text-gray-50 shadow-sm hover:shadow-md transition-all">
          <h2 className="text-4xl text-center font-bold">
            <CountUp start={0} end={20} duration={2.5} />+
          </h2>
          <h4 className="text-center text-lg mt-3">Total Quiz</h4>
        </div>

        {/* Total Categories */}
        <div className="rounded-xl p-6 md:p-10 bg-purple-50/50 dark:bg-gray-500 text-black dark:text-gray-50 shadow-sm hover:shadow-md transition-all">
          <h2 className="text-4xl text-center font-bold">
            <CountUp start={0} end={14} duration={2} />+
          </h2>
          <h4 className=" text-center text-lg mt-3">Total Categories</h4>
        </div>
      </div>
    </div>
  );
}
