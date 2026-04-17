'use client';

import { Maximize } from 'lucide-react';

export function EnterCinemaButton() {
  const handleEnterCinema = () => {
    const videoContainer = document.querySelector('[data-film-container="true"]') as HTMLElement;
    if (videoContainer) {
      videoContainer.requestFullscreen();
    }
  };

  return (
    <button
      onClick={handleEnterCinema}
      className="absolute bottom-28 left-8 md:left-12 lg:left-24 z-30 px-4 py-2 flex items-center gap-2 bg-[#0f0f0f]/80 backdrop-blur-sm border border-[#3a3530] hover:border-[#E07B39] transition-all duration-300 group"
    >
      <Maximize className="w-4 h-4 text-[#888] group-hover:text-[#E07B39]" />
      <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-[#888] group-hover:text-[#E07B39]">
        Enter Cinema
      </span>
    </button>
  );
}
