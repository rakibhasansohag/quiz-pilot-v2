import React from "react";
import { FaArrowRight } from "react-icons/fa";
import Text from "../Typography/Text";

export default function IconBTN({
  // text = "Get Started",
  onClick,
  icon: Icon = FaArrowRight,
}) {
  return (
    <button
      onClick={onClick}
      className="group relative flex items-center gap-3 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 px-6 py-3 font-semibold text-white shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl h-12 w-fit"
    >
      {/* Icon */}
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/20 transition-transform duration-300 -rotate-45 group-hover:rotate-1">
        <Icon className="text-lg" />
      </span>

      {/* Text */}
      <Text
        className="text-base tracking-wide"
        tag="subheading"
        text="Get Started"
      ></Text>

      {/* Glow effect */}
      <span className="absolute inset-0 rounded-xl bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 opacity-0 blur-lg transition-opacity duration-300 group-hover:opacity-30"></span>
    </button>
  );
}
