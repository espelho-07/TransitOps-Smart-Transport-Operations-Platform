import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, ArrowRight, Loader2, CheckCircle2, ShieldAlert } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { showToast } from '../../components/ui/Toast';
import AuthLayout from '../../components/auth/AuthLayout';
import AuthCard from '../../components/auth/AuthCard';
import PasswordInput from '../../components/auth/PasswordInput';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const validate = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      setError('Email address is required');
      return false;
    }
    if (!emailRegex.test(email)) {
      setError('Invalid email address format');
      return false;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return false;
    }
    setError('');
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setError('');

    try {
      const res = await login(email, password);
      if (res.success) {
        setSuccess(true);
        showToast.success(`Authenticated as ${res.user.name}`);
        
        // Wait for animation, then redirect based on role
        setTimeout(() => {
          navigate('/dashboard');
        }, 1000);
      }
    } catch (err) {
      setError(err.message || 'Incorrect email or password.');
      showToast.error(err.message || 'Incorrect email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <AuthCard
        title="Sign In"
        subtitle="Authenticate session credentials to access operations dashboard"
      >
        {error && (
          <div className="flex items-center gap-2.5 p-3.5 bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold rounded-lg text-left" role="alert">
            <ShieldAlert size={14} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="flex items-center gap-2.5 p-3.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold rounded-lg text-left" role="alert">
            <CheckCircle2 size={14} className="shrink-0" />
            <span>Clearance validated. Re-routing console...</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-bold text-slate-400">
          
          {/* Email input field */}
          <div className="flex flex-col gap-1.5 text-left">
            <label htmlFor="email" className="text-[10px] uppercase font-bold tracking-wider">Email Address</label>
            <div className="relative">
              <Mail size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="email"
                id="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="name@transitops.com"
                className="w-full pl-9 pr-3.5 py-2 bg-slate-950/60 border border-slate-800 rounded-lg text-slate-200 placeholder-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all"
              />
            </div>
          </div>

          {/* Password input field */}
          <div className="flex flex-col gap-1.5 text-left">
            <div className="flex items-center justify-between">
              <label htmlFor="password" className="text-[10px] uppercase font-bold tracking-wider">Password</label>
              <Link to="/forgot-password" className="text-[10px] text-blue-500 hover:underline">
                Forgot password?
              </Link>
            </div>
            <PasswordInput
              id="password"
              name="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </div>

          {/* Keep logged in check */}
          <div className="flex items-center justify-between text-slate-400 text-[10px] font-bold uppercase tracking-wide">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={e => setRememberMe(e.target.checked)}
                className="h-3.5 w-3.5 bg-slate-950 border-slate-800 rounded text-blue-500 focus:ring-0 focus:ring-offset-0"
              />
              <span>Remember Device</span>
            </label>
          </div>

          {/* Submit Action */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading || success}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-white font-bold rounded-lg transition-all shadow-lg shadow-blue-500/10 flex items-center justify-center gap-2 uppercase tracking-widest text-[10px] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-950"
            >
              {loading ? (
                <>
                  <Loader2 size={13} className="animate-spin" />
                  <span>Authorizing Session...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight size={13} />
                </>
              )}
            </button>
          </div>

        </form>

        <div className="text-center text-xs text-slate-500 pt-2 font-semibold">
          Don't have an account?{' '}
          <Link to="/signup" className="text-blue-500 hover:underline font-bold">
            Create Account
          </Link>
        </div>

      </AuthCard>
    </AuthLayout>
  );
};

export default LoginPage;
