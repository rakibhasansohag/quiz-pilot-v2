import React from "react";

export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-screen gap-4">
      <div className="w-12 h-12 rounded-full animate-spin border-y-2 border-solid border-violet-500 border-t-transparent shadow-md"></div>
    </div>
  );
}
