import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Compass, ArrowRight, CheckCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { showToast } from '../../components/ui/Toast';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const { forgotPassword } = useAuth();

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      setError('Email address is required');
      return;
    }
    setError('');
    setLoading(true);

    try {
      await forgotPassword(email);
      setIsSuccess(true);
      showToast.success('Password recovery link dispatched!');
    } catch (err) {
      setError(err.message || 'Verification dispatch failed');
    } finally {
      setLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0B0F19] text-[#E2E8F0] px-4 font-sans select-none text-left">
        <div className="max-w-md w-full p-8 rounded-2xl bg-slate-900/50 border border-slate-800 backdrop-blur-xl space-y-5">
          <div className="h-16 w-16 bg-success/10 text-success flex items-center justify-center rounded-full mx-auto">
            <CheckCircle size={36} />
          </div>
          <div className="space-y-2 text-center">
            <h2 className="text-xl font-black uppercase text-white tracking-tight">Recovery Sent!</h2>
            <p className="text-xs text-slate-400 font-semibold leading-relaxed">
              We have dispatched a secure recovery password reset link to **{email}**. Please click the link to configure new credentials.
            </p>
          </div>
          <button
            onClick={() => navigate('/reset-password')}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg text-xs uppercase tracking-widest transition-all"
          >
            Go to Reset Password
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0B0F19] text-[#E2E8F0] px-4 font-sans select-none text-left relative overflow-hidden">
      
      {/* Decors */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.1),transparent_60%)] filter blur-3xl" />

      <div className="max-w-md w-full space-y-6 p-8 rounded-2xl bg-slate-900/50 border border-slate-800 backdrop-blur-xl shadow-2xl relative z-10">
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2">
            <div className="h-7 w-7 bg-blue-500/10 text-blue-400 flex items-center justify-center rounded-lg">
              <Compass size={15} />
            </div>
            <span className="text-lg font-black tracking-tight text-white">TransitOps</span>
          </div>
          <h2 className="text-lg font-black uppercase text-white tracking-tight">Recover Password</h2>
          <p className="text-xs text-slate-400 font-semibold leading-relaxed">
            Enter your corporate email address. We will verify and dispatch reset instructions.
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold rounded-lg text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-bold text-slate-400">
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] uppercase font-bold tracking-wider">Email Address</label>
            <div className="relative">
              <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="name@transitops.com"
                className="w-full pl-9 pr-3.5 py-2.5 bg-slate-950/60 border border-slate-800 rounded-lg text-slate-200 placeholder-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg transition-all shadow-lg flex items-center justify-center gap-2 uppercase tracking-widest text-[10px]"
            >
              {loading ? 'Verifying Email...' : 'Send Recovery Instructions'}
              <ArrowRight size={13} />
            </button>
          </div>
        </form>

        <div className="text-center text-xs text-slate-500 mt-2">
          Recall credentials?{' '}
          <Link to="/login" className="text-blue-400 hover:underline font-bold">
            Sign In
          </Link>
        </div>
      </div>

    </div>
  );
};

export default ForgotPassword;
