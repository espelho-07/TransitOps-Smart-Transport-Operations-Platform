import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import Button from '../../components/ui/Button';

const AccessDenied = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6 select-none space-y-5">
      <div className="h-16 w-16 bg-danger/10 text-danger flex items-center justify-center rounded-2xl shadow-inner animate-pulse">
        <ShieldAlert size={32} />
      </div>

      <div className="space-y-2">
        <h2 className="text-4xl font-black tracking-tight text-text-main">403</h2>
        <h3 className="text-base font-black text-text-main uppercase tracking-wider">Access Denied</h3>
        <p className="text-text-secondary text-xs max-w-sm mx-auto leading-relaxed font-semibold">
          You do not possess the required Security Clearance privileges to inspect this operational section.
        </p>
      </div>

      <div className="pt-2">
        <Button variant="info" size="sm" onClick={() => navigate('/dashboard')} className="font-bold flex items-center gap-1.5 mx-auto">
          <ArrowLeft size={14} /> Back to Dashboard
        </Button>
      </div>
    </div>
  );
};

export default AccessDenied;
