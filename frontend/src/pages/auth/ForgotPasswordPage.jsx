import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, ArrowRight, CheckCircle2, ShieldAlert } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { showToast } from '../../components/ui/Toast';
import AuthLayout from '../../components/auth/AuthLayout';
import AuthCard from '../../components/auth/AuthCard';

const ForgotPasswordPage = () => {
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
      showToast.success('Recovery link dispatched successfully');
    } catch (err) {
      setError(err.message || 'Verification dispatch failed');
    } finally {
      setLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0B0F19] text-[#E2E8F0] px-4 font-sans select-none text-left">
        <div className="max-w-md w-full p-8 rounded-2xl bg-slate-900/40 border border-slate-800/80 backdrop-blur-xl space-y-5 text-center">
          <div className="h-16 w-16 bg-success/10 text-success flex items-center justify-center rounded-full mx-auto">
            <CheckCircle2 size={36} />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-black uppercase text-white tracking-tight">Link Dispatched</h2>
            <p className="text-xs text-slate-400 font-semibold leading-relaxed">
              We have dispatched a password reset link to **{email}**. Click the link to update your credentials.
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
    <AuthLayout>
      <AuthCard
        title="Reset Password"
        subtitle="Provide email link target to request credential recovery details"
      >
        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold rounded-lg text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-bold text-slate-400">
          
          <div className="flex flex-col gap-1.5 text-left">
            <label htmlFor="email" className="text-[10px] uppercase font-bold tracking-wider">Email Address</label>
            <div className="relative">
              <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="email"
                id="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="name@transitops.com"
                className="w-full pl-9 pr-3.5 py-2.5 bg-slate-950/60 border border-slate-800 rounded-lg text-slate-200 placeholder-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg transition-all shadow-lg flex items-center justify-center gap-2 uppercase tracking-widest text-[10px]"
            >
              {loading ? 'Dispatched Instructions...' : 'Send Reset Link'}
              <ArrowRight size={13} />
            </button>
          </div>
        </form>

        <div className="text-center text-xs text-slate-500 mt-2 font-semibold">
          Back to{' '}
          <Link to="/login" className="text-blue-500 hover:underline font-bold">
            Sign In
          </Link>
        </div>
      </AuthCard>
    </AuthLayout>
  );
};

export default ForgotPasswordPage;
