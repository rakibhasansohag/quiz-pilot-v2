"use client";

import React from "react";
import animationData from "@/components/notfoundlotties.json";
import { usePathname } from "next/navigation";
import Navbar from "../Navbar";
import Lottie from "lottie-react";
import { pickSuggestions } from "@/lib/routes";
import Link from "next/link";
import Text from "../shared/Typography/Text";

export default function NotFoundClient() {
  const pathname = usePathname();
  const suggestions = pickSuggestions(pathname);

  const hideNavbar = pathname.startsWith("/quiz/attempt/");

  return (
    <>
      {!hideNavbar && <Navbar />}
      <div className="flex flex-col items-center px-4">
        <div className="w-full max-w-7xl text-center">
          <div className="mx-auto w-64 md:w-[480px]">
            <Lottie animationData={animationData} loop={true} />
          </div>

          <Text
            tag="heading"
            text={`Looks like the Pilot’s compass malfunctioned on
            ${pathname}. `}
          ></Text>

          {/* Suggestions header */}
          <Text
            className="mt-4 mb-4"
            tag="paragraph"
            text="Here are some safe
            routes to continue your journey"
          >
            :
          </Text>

          {/* Suggestion cards */}
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto">
            {suggestions.map((s) => (
              <Link
                key={s.href}
                href={s.href}
                className="flex flex-col  items-center justify-center p-5 rounded-xl border shadow bg-purple-100 hover:bg-pink-50 transition dark:bg-zinc-500 dark:hover:bg-zinc-400"
              >
                <span className="text-sm font-semibold">{s.name}</span>
                <span className="text-xs text-gray-500 dark:text-gray-300">
                  {s.href === "/categories"
                    ? "Create and manage quiz"
                    : s.href === "/quiz"
                    ? "Start a new quiz"
                    : "Return home"}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
