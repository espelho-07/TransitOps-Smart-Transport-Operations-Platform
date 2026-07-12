import React from 'react';
import { Compass } from 'lucide-react';

const Logo = () => {
  return (
    <div className="flex items-center gap-2.5">
      <div className="h-8 w-8 bg-blue-600/15 text-blue-500 flex items-center justify-center rounded-lg border border-blue-500/20 shadow-sm">
        <Compass size={16} />
      </div>
      <span className="text-lg font-black tracking-tight text-white select-none">
        Transit<span className="text-blue-500">Ops</span>
      </span>
    </div>
  );
};

export default Logo;
