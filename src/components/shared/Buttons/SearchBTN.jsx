"use client";
import React, { useState } from "react";
import { FaSearch } from "react-icons/fa";
import Text from "../Typography/Text";

export default function SearchBTN() {
  const [isFocused, setIsFocused] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    setLoading(true);

    // Fake loading for demo
    setTimeout(() => {
      setLoading(false);
    }, 2000);
  };

  return (
    <div className="w-full flex justify-center mt-10">
      <form
        onSubmit={handleSearch}
        className={`flex items-center bg-white shadow-lg rounded-full px-4 py-2 transition-all duration-500 ${
          isFocused ? "w-[100%]" : "w-[60%]"
        }`}
      >
        <FaSearch className="text-gray-400 mr-3 text-lg" />

        <input
          type="text"
          placeholder="Search your Categories"
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className="flex-1 outline-none bg-transparent text-gray-700 placeholder-gray-400"
        />

        {loading ? (
          <div className="loader ml-3"></div>
        ) : (
          <button
            type="submit"
            className="ml-3 px-4 py-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full text-sm font-medium shadow hover:opacity-90 transition"
          >
            <Text tag="subheading" text="Search"></Text>
          </button>
        )}
      </form>

      {/* Custom Loader */}
      <style jsx>{`
        .loader {
          border: 3px solid #f3f3f3;
          border-top: 3px solid #6366f1;
          border-radius: 50%;
          width: 20px;
          height: 20px;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}
