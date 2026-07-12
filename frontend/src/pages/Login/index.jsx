import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Lock, Mail, Users, ArrowRight, Truck, Compass } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { showToast } from '../../components/ui/Toast';

const Login = () => {
  const [email, setEmail] = useState('admin@transitops.com');
  const [password, setPassword] = useState('password');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await login(email, password);
      if (response.success) {
        showToast.success(`Welcome back, ${response.user.name}!`);
        navigate('/dashboard');
      } else {
        setError('Login failed. Check your parameters.');
      }
    } catch (err) {
      setError(err.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = (demoEmail) => {
    setEmail(demoEmail);
    setPassword('password');
    setError('');
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-12 bg-[#0B0F19] text-[#E2E8F0] select-none font-sans overflow-hidden">
      
      {/* LEFT COLUMN: ERP Branding & Illustration (7 cols) */}
      <div className="hidden lg:flex lg:col-span-7 bg-[#0f172a] border-r border-slate-800/60 p-12 flex-col justify-between relative overflow-hidden">
        {/* Blur shapes */}
        <div className="absolute -top-[20%] -left-[20%] w-[60%] h-[60%] rounded-full bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.12),transparent_70%)] filter blur-3xl" />
        <div className="absolute -bottom-[20%] -right-[20%] w-[60%] h-[60%] rounded-full bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.08),transparent_70%)] filter blur-3xl" />

        {/* Top Header */}
        <div className="flex items-center gap-3 relative z-10">
          <div className="h-9 w-9 bg-blue-500/10 text-blue-400 flex items-center justify-center rounded-lg border border-blue-500/20">
            <Compass size={18} />
          </div>
          <span className="text-xl font-black tracking-tight text-white">
            Transit<span className="text-blue-400">Ops</span>
          </span>
        </div>

        {/* Center Content */}
        <div className="space-y-6 max-w-lg relative z-10 my-auto text-left">
          <h1 className="text-3xl font-black text-white leading-tight uppercase tracking-tight">
            Enterprise Smart <br />
            <span className="bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">Transport Operations</span> Platform
          </h1>
          <p className="text-sm text-slate-400 leading-relaxed font-semibold">
            TransitOps coordinates real-time vehicle dispatch, custodian operator logs, preventive diagnostics work orders, and fuel ledger auditing under a unified dashboard.
          </p>

          {/* Bullet features */}
          <div className="space-y-3.5 pt-4 text-xs font-bold text-slate-300">
            <div className="flex items-center gap-3">
              <div className="h-2 w-2 rounded-full bg-blue-400" />
              <span>Real-Time Fleet Inventory Monitoring & Telematics</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-2 w-2 rounded-full bg-emerald-400" />
              <span>Operator Status, Licensing, & Compliance Registers</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-2 w-2 rounded-full bg-blue-400" />
              <span>Preventive Service Work Orders & Mechanics Dispatches</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-2 w-2 rounded-full bg-emerald-400" />
              <span>Comprehensive Expenses and Fuel Efficiency Statements</span>
            </div>
          </div>
        </div>

        {/* Bottom stats */}
        <div className="flex items-center justify-between text-slate-500 text-[10px] font-bold uppercase tracking-widest relative z-10 border-t border-slate-800/40 pt-4">
          <span>Odoo Hackathon Project</span>
          <span>Version v1.0.0-hackathon</span>
        </div>
      </div>

      {/* RIGHT COLUMN: Sign In Cards (5 cols) */}
      <div className="lg:col-span-5 flex flex-col justify-center px-6 sm:px-12 py-8 relative">
        {/* Mobile top header */}
        <div className="lg:hidden flex items-center gap-2 mb-8 justify-center">
          <div className="h-8 w-8 bg-blue-500/10 text-blue-400 flex items-center justify-center rounded-lg">
            <Compass size={16} />
          </div>
          <span className="text-lg font-black tracking-tight text-white">
            Transit<span className="text-blue-400">Ops</span>
          </span>
        </div>

        <div className="max-w-sm w-full mx-auto space-y-6">
          <div className="text-center lg:text-left space-y-1.5">
            <h2 className="text-xl font-black text-white uppercase tracking-tight">Sign In to Dashboard</h2>
            <p className="text-xs text-slate-400 font-semibold">Enter your corporate credentials to audit operations</p>
          </div>

          {error && (
            <div className="p-3.5 bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold rounded-xl text-center">
              {error}
            </div>
          )}

          {/* Login Form */}
          <form className="space-y-4 text-xs font-bold text-slate-400 text-left" onSubmit={handleLogin}>
            
            <div className="flex flex-col gap-2">
              <label className="text-[10px] uppercase font-bold tracking-wider">Email Address</label>
              <div className="relative">
                <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="name@transitops.com"
                  className="w-full pl-10 pr-4 py-3 bg-slate-900/60 border border-slate-800 rounded-lg text-slate-200 placeholder-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors font-medium"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <label className="text-[10px] uppercase font-bold tracking-wider">Password</label>
                <a href="#forgot" onClick={(e) => { e.preventDefault(); showToast.info('Recovery trigger email dispatched.'); }} className="text-[10px] text-blue-400 hover:underline">
                  Forgot Password?
                </a>
              </div>
              <div className="relative">
                <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 bg-slate-900/60 border border-slate-800 rounded-lg text-slate-200 placeholder-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                />
              </div>
            </div>

            {/* Remember Me */}
            <label className="flex items-center gap-2.5 cursor-pointer text-slate-400">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={() => setRememberMe(prev => !prev)}
                className="h-4 w-4 bg-slate-900 border-slate-800 rounded text-blue-500 focus:ring-0"
              />
              <span className="font-semibold text-[10px] uppercase tracking-wider">Remember this browser</span>
            </label>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg transition-all shadow-lg shadow-blue-500/10 flex items-center justify-center gap-2 uppercase tracking-widest text-[10px]"
              >
                {loading ? 'Validating Session...' : 'Authenticate Access'}
                <ArrowRight size={13} />
              </button>
            </div>

          </form>

          {/* Quick Demo Accounts Selection */}
          <div className="border-t border-slate-800/80 pt-5 space-y-3 text-left">
            <span className="block text-[10px] font-black text-blue-400 uppercase tracking-widest">
              Console Demo Roles Fill
            </span>

            <div className="grid grid-cols-2 gap-2 text-[9.5px] font-black uppercase tracking-wider">
              <button
                onClick={() => handleQuickFill('admin@transitops.com')}
                className="px-2.5 py-2 border border-slate-800 bg-slate-900/40 rounded-lg text-slate-300 hover:bg-slate-900 hover:border-slate-700 hover:text-white transition-all text-left truncate"
              >
                🏢 Admin User
              </button>
              <button
                onClick={() => handleQuickFill('manager@transitops.com')}
                className="px-2.5 py-2 border border-slate-800 bg-slate-900/40 rounded-lg text-slate-300 hover:bg-slate-900 hover:border-slate-700 hover:text-white transition-all text-left truncate"
              >
                🚚 Fleet Manager
              </button>
              <button
                onClick={() => handleQuickFill('driver@transitops.com')}
                className="px-2.5 py-2 border border-slate-800 bg-slate-900/40 rounded-lg text-slate-300 hover:bg-slate-900 hover:border-slate-700 hover:text-white transition-all text-left truncate"
              >
                👤 Driver Pilot
              </button>
              <button
                onClick={() => handleQuickFill('safety@transitops.com')}
                className="px-2.5 py-2 border border-slate-800 bg-slate-900/40 rounded-lg text-slate-300 hover:bg-slate-900 hover:border-slate-700 hover:text-white transition-all text-left truncate"
              >
                🛡️ Safety Audit
              </button>
              <button
                onClick={() => handleQuickFill('analyst@transitops.com')}
                className="col-span-2 px-2.5 py-2 border border-slate-800 bg-slate-900/40 rounded-lg text-slate-300 hover:bg-slate-900 hover:border-slate-700 hover:text-white transition-all text-center truncate"
              >
                📊 Financial Analyst
              </button>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};

export default Login;
