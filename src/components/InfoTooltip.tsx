import React, { useState } from 'react';
import { HelpCircle } from 'lucide-react';

interface InfoTooltipProps {
  text: string;
}

/**
 * Desktop: reveals on hover. Touch: `group-hover` never fires, so the icon is
 * also a button that toggles the popup. Either way the popup is `hidden` when
 * closed rather than `opacity-0` — a popup left in the DOM still contributes
 * its width to the page's scroll area, which forced horizontal scrolling on
 * narrow screens whenever a tooltip sat near the right edge.
 */
const InfoTooltip: React.FC<InfoTooltipProps> = ({ text }) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative group inline-flex items-center justify-center">
      <button
        type="button"
        aria-label="More info"
        aria-expanded={open}
        onClick={e => { e.stopPropagation(); setOpen(o => !o); }}
        onBlur={() => setOpen(false)}
        className="-m-3.5 p-3.5 flex items-center justify-center rounded-full"
      >
        <HelpCircle className="w-4 h-4 md:w-3.5 md:h-3.5 text-emerald-500 drop-shadow-[0_0_6px_rgba(16,185,129,0.6)] cursor-help transition-all group-hover:scale-110" />
      </button>
      <div
        className={`${open ? 'block right-0' : 'hidden group-hover:block left-1/2 -translate-x-1/2'} absolute bottom-full mb-2 w-48 max-w-[calc(100vw-2rem)] z-50`}
      >
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
