import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Compass, ShieldCheck, ArrowRight } from 'lucide-react';
import { showToast } from '../../components/ui/Toast';

const EmailVerification = () => {
  const navigate = useNavigate();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!code || code.length < 4) {
      showToast.error('Please input the 4-digit verification code');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      showToast.success('Email confirmed successfully!');
      navigate('/login');
      setLoading(false);
    }, 500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0B0F19] text-[#E2E8F0] px-4 font-sans select-none text-left relative overflow-hidden">
      <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.08),transparent_60%)] filter blur-3xl" />

      <div className="max-w-md w-full space-y-6 p-8 rounded-2xl bg-slate-900/50 border border-slate-800 backdrop-blur-xl shadow-2xl relative z-10">
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2">
            <div className="h-7 w-7 bg-blue-500/10 text-blue-400 flex items-center justify-center rounded-lg">
              <Compass size={15} />
            </div>
            <span className="text-lg font-black tracking-tight text-white">TransitOps</span>
          </div>
          <h2 className="text-lg font-black uppercase text-white tracking-tight">Confirm Verification</h2>
          <p className="text-xs text-slate-400 font-semibold leading-relaxed">
            We have dispatched a 4-digit verification code to your email. Enter the security code below to activate your account.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-bold text-slate-400 text-center">
          <div className="flex flex-col gap-1.5 max-w-xs mx-auto">
            <label className="text-[10px] uppercase font-bold tracking-wider text-left">Security Code</label>
            <input
              type="text"
              required
              maxLength={4}
              value={code}
              onChange={e => setCode(e.target.value.replace(/\D/g, ''))}
              placeholder="1234"
              className="w-full text-center tracking-[1em] text-lg font-black py-2.5 bg-slate-950/60 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg transition-all shadow-lg flex items-center justify-center gap-2 uppercase tracking-widest text-[10px]"
            >
              {loading ? 'Confirming...' : 'Verify Activation Code'}
              <ArrowRight size={13} />
            </button>
          </div>
        </form>

        <div className="text-center text-xs text-slate-500">
          Didn't receive the email?{' '}
          <button onClick={() => showToast.success('New activation code code dispatched')} className="text-blue-400 hover:underline font-bold bg-transparent border-none p-0 cursor-pointer">
            Resend Code
          </button>
        </div>
      </div>

    </div>
  );
};

export default EmailVerification;
