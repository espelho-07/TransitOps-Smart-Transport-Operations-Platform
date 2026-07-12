import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Compass, HelpCircle } from 'lucide-react';
import Button from '../../components/ui/Button';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6 select-none space-y-5">
      <div className="h-16 w-16 bg-danger/10 text-danger flex items-center justify-center rounded-2xl shadow-inner animate-pulse">
        <Compass size={32} />
      </div>

      <div className="space-y-2">
        <h2 className="text-4xl font-black tracking-tight text-text-main">404</h2>
        <h3 className="text-base font-black text-text-main uppercase tracking-wider">Page Not Found</h3>
        <p className="text-text-secondary text-xs max-w-sm mx-auto leading-relaxed font-semibold">
          The operations dashboard link you followed might have expired, or does not exist under your current role clearance level.
        </p>
      </div>

      <div className="flex gap-3 pt-2">
        <Button variant="info" size="sm" onClick={() => navigate('/dashboard')} className="font-bold">
          Console Dashboard
        </Button>
        <Button variant="outline" size="sm" onClick={() => navigate('/help')} className="font-bold flex items-center gap-1.5">
          <HelpCircle size={14} /> Help Center
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
