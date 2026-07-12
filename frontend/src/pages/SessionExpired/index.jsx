import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, LogIn } from 'lucide-react';
import Button from '../../components/ui/Button';

const SessionExpired = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0B0F19] text-[#E2E8F0] px-4 font-sans select-none text-left relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-[radial-gradient(circle_at_center,rgba(239,68,68,0.06),transparent_60%)] filter blur-3xl" />

      <div className="max-w-md w-full space-y-6 p-8 rounded-2xl bg-slate-900/50 border border-slate-800 backdrop-blur-xl shadow-2xl relative z-10 text-center">
        <div className="h-16 w-16 bg-warning/10 text-warning flex items-center justify-center rounded-2xl mx-auto animate-pulse">
          <Clock size={32} />
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-black uppercase text-white tracking-tight">Session Expired</h2>
          <p className="text-xs text-slate-400 font-semibold leading-relaxed">
            Your TransitOps security session credentials have expired or were logged out from another browser device. Please sign in again.
          </p>
        </div>

        <div className="pt-2">
          <Button
            variant="info"
            onClick={() => navigate('/login')}
            className="w-full font-bold flex items-center justify-center gap-1.5"
          >
            <LogIn size={14} />
            <span>Sign In</span>
          </Button>
        </div>
      </div>

    </div>
  );
};

export default SessionExpired;
