import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Phone, Lock, User, Compass, ArrowRight, Sun, Moon, CheckCircle, ShieldAlert } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { showToast } from '../../components/ui/Toast';

const SignUp = () => {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'Fleet Manager',
    company: 'TransitOps Logistics',
    acceptTerms: false
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleInputChange = (field, val) => {
    setFormData(prev => ({ ...prev, [field]: val }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const calculatePasswordStrength = (pass) => {
    if (!pass) return { score: 0, text: 'No Password', color: 'bg-slate-700' };
    let score = 0;
    if (pass.length >= 8) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;

    switch (score) {
      case 4: return { score, text: 'Strong Password', color: 'bg-success' };
      case 3: return { score, text: 'Medium Password', color: 'bg-warning' };
      default: return { score, text: 'Weak Password', color: 'bg-danger' };
    }
  };

  const passStrength = calculatePasswordStrength(formData.password);

  const validate = () => {
    const tempErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;

    if (!formData.firstName.trim()) tempErrors.firstName = 'First name required';
    if (!formData.lastName.trim()) tempErrors.lastName = 'Last name required';
    
    if (!formData.email.trim()) {
      tempErrors.email = 'Email required';
    } else if (!emailRegex.test(formData.email)) {
      tempErrors.email = 'Invalid email address';
    }

    if (formData.phone && !phoneRegex.test(formData.phone.replace(/[\s()-]/g, ''))) {
      tempErrors.phone = 'Invalid phone number format';
    }

    if (formData.password.length < 6) {
      tempErrors.password = 'Password must be at least 6 characters';
    }

    if (formData.password !== formData.confirmPassword) {
      tempErrors.confirmPassword = 'Passwords do not match';
    }

    if (!formData.acceptTerms) {
      tempErrors.acceptTerms = 'You must accept the terms of service';
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      showToast.error('Please resolve validation warnings');
      return;
    }

    setLoading(true);
    try {
      await signup(formData);
      setIsSuccess(true);
      showToast.success('Account created successfully!');
    } catch (err) {
      setErrors({ email: err.message });
      showToast.error(err.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0B0F19] text-[#E2E8F0] px-4 font-sans select-none">
        <div className="max-w-md w-full p-8 rounded-2xl bg-slate-900/50 border border-slate-800 backdrop-blur-xl text-center space-y-5">
          <div className="h-16 w-16 bg-success/10 text-success flex items-center justify-center rounded-full mx-auto">
            <CheckCircle size={36} />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-black uppercase text-white tracking-tight">Account Created!</h2>
            <p className="text-xs text-slate-400 font-semibold leading-relaxed">
              Your operator credentials have been registered in the database. Please sign in to verify your clearances.
            </p>
          </div>
          <button
            onClick={() => navigate('/login')}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg text-xs uppercase tracking-widest transition-all"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-12 bg-[#0B0F19] text-[#E2E8F0] select-none font-sans overflow-hidden">
      
      {/* LEFT COLUMN: ERP Branding & Illustration (5 cols) */}
      <div className="hidden lg:flex lg:col-span-5 bg-[#0f172a] border-r border-slate-800/60 p-12 flex-col justify-between relative overflow-hidden text-left">
        <div className="absolute -top-[20%] -left-[20%] w-[60%] h-[60%] rounded-full bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.12),transparent_70%)] filter blur-3xl" />

        <div className="flex items-center gap-3 relative z-10">
          <div className="h-9 w-9 bg-blue-500/10 text-blue-400 flex items-center justify-center rounded-lg border border-blue-500/20">
            <Compass size={18} />
          </div>
          <span className="text-xl font-black tracking-tight text-white">
            Transit<span className="text-blue-400">Ops</span>
          </span>
        </div>

        <div className="space-y-6 max-w-sm relative z-10 my-auto">
          <h1 className="text-2xl font-black text-white leading-tight uppercase tracking-tight">
            Enterprise <br />
            Registration
          </h1>
          <p className="text-xs text-slate-400 leading-relaxed font-semibold">
            Create an Admin or Fleet Manager session to deploy logistics workflows, analyze assets, and audit fuel costs.
          </p>

          <div className="space-y-3.5 pt-4 text-[11px] font-bold text-slate-300">
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-blue-400" />
              <span>Dedicated Fleet Management Controls</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              <span>Real-Time Logistics Operations</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-blue-400" />
              <span>Cost Center & Fuel Ledger Audits</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between text-slate-500 text-[10px] font-bold uppercase tracking-widest relative z-10">
          <span>TransitOps ERP</span>
          <span>Security Level-3</span>
        </div>
      </div>

      {/* RIGHT COLUMN: Registration Form (7 cols) */}
      <div className="lg:col-span-7 flex flex-col justify-center px-6 sm:px-12 py-10 relative overflow-y-auto max-h-screen custom-scrollbar">
        {/* Floating Theme Switch */}
        <button
          onClick={toggleTheme}
          className="absolute top-6 right-6 p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
        >
          {isDark ? <Sun size={15} /> : <Moon size={15} />}
        </button>

        <div className="max-w-md w-full mx-auto space-y-6 text-left">
          <div className="space-y-1">
            <h2 className="text-xl font-black text-white uppercase tracking-tight">Register Credentials</h2>
            <p className="text-xs text-slate-400 font-semibold">Fill in the fields to deploy a workspace session</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3.5 text-xs font-bold text-slate-400">
            
            <div className="grid grid-cols-2 gap-3.5">
              <div className="flex flex-col gap-1.5">
                <label className="text-[9.5px] uppercase tracking-wider">First Name</label>
                <div className="relative">
                  <User size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={e => handleInputChange('firstName', e.target.value)}
                    placeholder="John"
                    className="w-full pl-9 pr-3 py-2 bg-slate-900/60 border border-slate-800 rounded-lg text-slate-200 placeholder-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                  />
                </div>
                {errors.firstName && <p className="text-danger text-[10px] mt-0.5">{errors.firstName}</p>}
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[9.5px] uppercase tracking-wider">Last Name</label>
                <div className="relative">
                  <User size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={e => handleInputChange('lastName', e.target.value)}
                    placeholder="Doe"
                    className="w-full pl-9 pr-3 py-2 bg-slate-900/60 border border-slate-800 rounded-lg text-slate-200 placeholder-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                  />
                </div>
                {errors.lastName && <p className="text-danger text-[10px] mt-0.5">{errors.lastName}</p>}
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[9.5px] uppercase tracking-wider">Email Address</label>
              <div className="relative">
                <Mail size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={e => handleInputChange('email', e.target.value)}
                  placeholder="john.doe@transitops.com"
                  className="w-full pl-9 pr-3 py-2 bg-slate-900/60 border border-slate-800 rounded-lg text-slate-200 placeholder-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                />
              </div>
              {errors.email && <p className="text-danger text-[10px] mt-0.5">{errors.email}</p>}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[9.5px] uppercase tracking-wider">Phone Number</label>
              <div className="relative">
                <Phone size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  value={formData.phone}
                  onChange={e => handleInputChange('phone', e.target.value)}
                  placeholder="+1 (555) 019-2834"
                  className="w-full pl-9 pr-3 py-2 bg-slate-900/60 border border-slate-800 rounded-lg text-slate-200 placeholder-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                />
              </div>
              {errors.phone && <p className="text-danger text-[10px] mt-0.5">{errors.phone}</p>}
            </div>

            <div className="grid grid-cols-2 gap-3.5">
              <div className="flex flex-col gap-1.5">
                <label className="text-[9.5px] uppercase tracking-wider">Password</label>
                <div className="relative">
                  <Lock size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="password"
                    required
                    value={formData.password}
                    onChange={e => handleInputChange('password', e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2 bg-slate-900/60 border border-slate-800 rounded-lg text-slate-200 placeholder-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                  />
                </div>
                {formData.password && (
                  <div className="space-y-1 mt-1.5">
                    <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                      <div className={`h-full ${passStrength.color} transition-all`} style={{ width: `${(passStrength.score / 4) * 100}%` }} />
                    </div>
                    <span className="text-[9px] text-slate-400 block font-bold">{passStrength.text}</span>
                  </div>
                )}
                {errors.password && <p className="text-danger text-[10px] mt-0.5">{errors.password}</p>}
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[9.5px] uppercase tracking-wider">Confirm Password</label>
                <div className="relative">
                  <Lock size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="password"
                    required
                    value={formData.confirmPassword}
                    onChange={e => handleInputChange('confirmPassword', e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2 bg-slate-900/60 border border-slate-800 rounded-lg text-slate-200 placeholder-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                  />
                </div>
                {errors.confirmPassword && <p className="text-danger text-[10px] mt-0.5">{errors.confirmPassword}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3.5">
              <div className="flex flex-col gap-1.5">
                <label className="text-[9.5px] uppercase tracking-wider">Role</label>
                <select
                  value={formData.role}
                  onChange={e => handleInputChange('role', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900/60 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                >
                  <option value="Fleet Manager">Fleet Manager</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[9.5px] uppercase tracking-wider">Company</label>
                <input
                  type="text"
                  value={formData.company}
                  onChange={e => handleInputChange('company', e.target.value)}
                  placeholder="TransitOps Logistics"
                  className="w-full px-3 py-2 bg-slate-900/60 border border-slate-800 rounded-lg text-slate-200 placeholder-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                />
              </div>
            </div>

            {/* Accept Terms Checkbox */}
            <label className="flex items-start gap-2.5 cursor-pointer pt-1.5">
              <input
                type="checkbox"
                checked={formData.acceptTerms}
                onChange={e => handleInputChange('acceptTerms', e.target.checked)}
                className="h-4 w-4 bg-slate-900 border-slate-800 rounded text-blue-500 focus:ring-0 mt-0.5"
              />
              <span className="font-semibold text-[10px] uppercase leading-normal tracking-wide text-slate-400">
                I accept the TransitOps terms of service and corporate compliance guidelines.
              </span>
            </label>
            {errors.acceptTerms && <p className="text-danger text-[10px]">{errors.acceptTerms}</p>}

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg transition-all shadow-lg shadow-blue-500/10 flex items-center justify-center gap-2 uppercase tracking-widest text-[10px]"
              >
                {loading ? 'Registering Account...' : 'Create Account'}
                <ArrowRight size={13} />
              </button>
            </div>

          </form>

          <div className="text-center text-xs text-slate-500">
            Already have a corporate session?{' '}
            <Link to="/login" className="text-blue-400 hover:underline font-bold">
              Sign In
            </Link>
          </div>
        </div>
      </div>

    </div>
  );
};

export default SignUp;
