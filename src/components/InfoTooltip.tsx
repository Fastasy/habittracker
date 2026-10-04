import React from 'react';
import { HelpCircle } from 'lucide-react';

interface InfoTooltipProps {
  text: string;
}

const InfoTooltip: React.FC<InfoTooltipProps> = ({ text }) => {
  return (
    <div className="relative group inline-flex items-center justify-center">
      <HelpCircle className="w-3.5 h-3.5 text-emerald-500 drop-shadow-[0_0_6px_rgba(16,185,129,0.6)] cursor-help transition-all group-hover:scale-110" />
      {/*
        `hidden group-hover:block` rather than opacity-only: a popup left in the
        DOM at all times still contributes its 192px width to the page's scroll
        area, which forced horizontal scrolling on narrow screens whenever a
        tooltip sat near the right edge.
      */}
      <div className="hidden group-hover:block absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 z-50">
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
