import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Phone, User, Compass, ArrowRight, CheckCircle2, ShieldAlert, Briefcase } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { showToast } from '../../components/ui/Toast';
import AuthLayout from '../../components/auth/AuthLayout';
import AuthCard from '../../components/auth/AuthCard';
import PasswordInput from '../../components/auth/PasswordInput';

const SignupPage = () => {
  const navigate = useNavigate();
  const { signup } = useAuth();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    company: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
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
    if (!pass) return { score: 0, text: 'No Password', color: 'bg-slate-800' };
    let score = 0;
    if (pass.length >= 8) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;

    switch (score) {
      case 4: return { score, text: 'Strong password configuration', color: 'bg-success' };
      case 3: return { score, text: 'Medium password strength', color: 'bg-warning' };
      default: return { score, text: 'Weak password complexity', color: 'bg-danger' };
    }
  };

  const passStrength = calculatePasswordStrength(formData.password);

  const validate = () => {
    const tempErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;

    if (!formData.firstName.trim()) tempErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) tempErrors.lastName = 'Last name is required';
    
    if (!formData.email.trim()) {
      tempErrors.email = 'Email address is required';
    } else if (!emailRegex.test(formData.email)) {
      tempErrors.email = 'Invalid email address';
    }

    if (formData.phone && !phoneRegex.test(formData.phone.replace(/[\s()-]/g, ''))) {
      tempErrors.phone = 'Invalid phone format (e.g. +1 555-019-2834)';
    }

    if (formData.password.length < 6) {
      tempErrors.password = 'Password must be at least 6 characters';
    }

    if (formData.password !== formData.confirmPassword) {
      tempErrors.confirmPassword = 'Passwords do not match';
    }

    if (!formData.acceptTerms) {
      tempErrors.acceptTerms = 'You must accept compliance terms';
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      showToast.error('Please resolve validation errors');
      return;
    }

    setLoading(true);
    try {
      // Pass a default role for demo accounts registered via signup
      await signup({
        ...formData,
        role: 'Fleet Manager'
      });
      setIsSuccess(true);
      showToast.success('Account created successfully!');
    } catch (err) {
      setErrors({ email: err.message });
      showToast.error(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0B0F19] text-[#E2E8F0] px-4 font-sans select-none text-left">
        <div className="max-w-md w-full p-8 rounded-2xl bg-slate-900/40 border border-slate-800/80 backdrop-blur-xl text-center space-y-5">
          <div className="h-16 w-16 bg-success/10 text-success flex items-center justify-center rounded-full mx-auto">
            <CheckCircle2 size={36} />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-black uppercase text-white tracking-tight">Account Created!</h2>
            <p className="text-xs text-slate-400 font-semibold leading-relaxed">
              Your TransitOps operator credentials have been registered in the database. Please sign in to verify your credentials.
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
    <AuthLayout>
      <AuthCard
        title="Create Account"
        subtitle="Configure your details to register a corporate operator session"
      >
        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs font-bold text-slate-400">
          
          <div className="grid grid-cols-2 gap-3.5">
            <div className="flex flex-col gap-1.5 text-left">
              <label htmlFor="firstName" className="text-[9.5px] uppercase tracking-wider">First Name</label>
              <div className="relative">
                <User size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  id="firstName"
                  required
                  value={formData.firstName}
                  onChange={e => handleInputChange('firstName', e.target.value)}
                  placeholder="John"
                  className="w-full pl-9 pr-3 py-2 bg-slate-950/60 border border-slate-800 rounded-lg text-slate-200 placeholder-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-colors"
                />
              </div>
              {errors.firstName && <p className="text-danger text-[10px] mt-0.5">{errors.firstName}</p>}
            </div>

            <div className="flex flex-col gap-1.5 text-left">
              <label htmlFor="lastName" className="text-[9.5px] uppercase tracking-wider">Last Name</label>
              <div className="relative">
                <User size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  id="lastName"
                  required
                  value={formData.lastName}
                  onChange={e => handleInputChange('lastName', e.target.value)}
                  placeholder="Doe"
                  className="w-full pl-9 pr-3 py-2 bg-slate-950/60 border border-slate-800 rounded-lg text-slate-200 placeholder-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-colors"
                />
              </div>
              {errors.lastName && <p className="text-danger text-[10px] mt-0.5">{errors.lastName}</p>}
            </div>
          </div>

          <div className="flex flex-col gap-1.5 text-left">
            <label htmlFor="company" className="text-[9.5px] uppercase tracking-wider">Company</label>
            <div className="relative">
              <Briefcase size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                id="company"
                required
                value={formData.company}
                onChange={e => handleInputChange('company', e.target.value)}
                placeholder="TransitOps Logistics"
                className="w-full pl-9 pr-3 py-2 bg-slate-950/60 border border-slate-800 rounded-lg text-slate-200 placeholder-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-colors"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5 text-left">
            <label htmlFor="email" className="text-[9.5px] uppercase tracking-wider">Email Address</label>
            <div className="relative">
              <Mail size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="email"
                id="email"
                required
                value={formData.email}
                onChange={e => handleInputChange('email', e.target.value)}
                placeholder="john.doe@transitops.com"
                className="w-full pl-9 pr-3 py-2 bg-slate-950/60 border border-slate-800 rounded-lg text-slate-200 placeholder-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-colors"
              />
            </div>
            {errors.email && <p className="text-danger text-[10px] mt-0.5">{errors.email}</p>}
          </div>

          <div className="flex flex-col gap-1.5 text-left">
            <label htmlFor="phone" className="text-[9.5px] uppercase tracking-wider">Phone Number</label>
            <div className="relative">
              <Phone size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                id="phone"
                value={formData.phone}
                onChange={e => handleInputChange('phone', e.target.value)}
                placeholder="+1 (555) 019-2834"
                className="w-full pl-9 pr-3 py-2 bg-slate-950/60 border border-slate-800 rounded-lg text-slate-200 placeholder-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-colors"
              />
            </div>
            {errors.phone && <p className="text-danger text-[10px] mt-0.5">{errors.phone}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3.5">
            <div className="flex flex-col gap-1.5 text-left">
              <label htmlFor="password" className="text-[9.5px] uppercase tracking-wider">Password</label>
              <PasswordInput
                id="password"
                name="password"
                value={formData.password}
                onChange={e => handleInputChange('password', e.target.value)}
              />
              {formData.password && (
                <div className="space-y-1 mt-1.5">
                  <div className="h-1 w-full bg-slate-850 rounded-full overflow-hidden">
                    <div className={`h-full ${passStrength.color} transition-all`} style={{ width: `${(passStrength.score / 4) * 100}%` }} />
                  </div>
                  <span className="text-[9px] text-slate-500 block font-bold">{passStrength.text}</span>
                </div>
              )}
              {errors.password && <p className="text-danger text-[10px] mt-0.5">{errors.password}</p>}
            </div>

            <div className="flex flex-col gap-1.5 text-left">
              <label htmlFor="confirmPassword" className="text-[9.5px] uppercase tracking-wider">Confirm Password</label>
              <PasswordInput
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={e => handleInputChange('confirmPassword', e.target.value)}
              />
              {errors.confirmPassword && <p className="text-danger text-[10px] mt-0.5">{errors.confirmPassword}</p>}
            </div>
          </div>

          <label className="flex items-start gap-2.5 cursor-pointer pt-1.5 text-left">
            <input
              type="checkbox"
              id="acceptTerms"
              checked={formData.acceptTerms}
              onChange={e => handleInputChange('acceptTerms', e.target.checked)}
              className="h-4 w-4 bg-slate-950 border-slate-800 rounded text-blue-500 focus:ring-0 focus:ring-offset-0 mt-0.5"
            />
            <span className="font-semibold text-[10px] uppercase leading-normal tracking-wide text-slate-400">
              I accept the TransitOps terms of service and corporate compliance guidelines.
            </span>
          </label>
          {errors.acceptTerms && <p className="text-danger text-[10px] text-left">{errors.acceptTerms}</p>}

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg transition-all shadow-lg flex items-center justify-center gap-2 uppercase tracking-widest text-[10px]"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
              <ArrowRight size={13} />
            </button>
          </div>

        </form>

        <div className="text-center text-xs text-slate-500 pt-2 font-semibold">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-500 hover:underline font-bold">
            Sign In
          </Link>
        </div>
      </AuthCard>
    </AuthLayout>
  );
};

export default SignupPage;
