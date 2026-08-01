import React from 'react';
import { HelpCircle } from 'lucide-react';

interface InfoTooltipProps {
  text: string;
}

const InfoTooltip: React.FC<InfoTooltipProps> = ({ text }) => {
  return (
    <div className="relative group inline-flex items-center justify-center">
      <HelpCircle className="w-3.5 h-3.5 text-emerald-500 drop-shadow-[0_0_6px_rgba(16,185,129,0.6)] cursor-help transition-all group-hover:scale-110" />
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity duration-200 z-50">
        <div className="bg-zinc-900 dark:bg-black border border-zinc-700 dark:border-zinc-800 text-zinc-200 dark:text-zinc-300 text-xs rounded-lg p-2.5 shadow-xl text-center leading-relaxed">
          {text}
          {/* Arrow */}
          <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-zinc-900 dark:bg-black border-r border-b border-zinc-700 dark:border-zinc-800 rotate-45" />
        </div>
      </div>
    </div>
  );
};

export default InfoTooltip;
