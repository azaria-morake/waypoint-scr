"use client";

import React from "react";

export const BoloConsoleFooter: React.FC = () => {
  return (
    <footer className="w-full bg-[#eae5dc] border-t border-[#d2ccc0] px-6 py-1.5 flex items-center justify-between text-stone-800 text-[10px] sm:text-[11px] font-mono font-bold tracking-wider select-none z-30 flex-shrink-0 shadow-inner">
      <div className="flex items-center space-x-2">
        <span className="text-stone-900 font-black">BOLO CONSOLE</span>
        <span className="text-stone-500">//</span>
        <span className="text-stone-700">OPERATOR DASHBOARD</span>
      </div>
      <div className="flex items-center space-x-2">
        <span className="text-stone-700">FNB AOTY HACKATHON 2026</span>
        <span className="text-stone-500">//</span>
        <span className="text-stone-900 font-black">ARTIFICIAL STAR</span>
      </div>
    </footer>
  );
};
