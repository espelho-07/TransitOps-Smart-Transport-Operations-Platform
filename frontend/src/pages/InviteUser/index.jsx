import React, { useState } from 'react';
import { Mail, Shield, UserPlus, Send, Copy, Check } from 'lucide-react';
import PageContainer from '../../components/ui/PageContainer';
import Button from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';
import { showToast } from '../../components/ui/Toast';
import { activityService } from '../../services/activityService';

const InviteUser = () => {
  const { currentUser } = useAuth();
  const isAdmin = currentUser?.role === 'Admin';

  const [inviteData, setInviteData] = useState({
    email: '',
    role: 'Driver',
    message: 'Hello, you have been invited to join TransitOps Logistics ERP. Please register your console credentials.'
  });

  const [copiedLink, setCopiedLink] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [errors, setErrors] = useState({});

  const handleInputChange = (field, val) => {
    setInviteData(prev => ({ ...prev, [field]: val }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const validate = () => {
    const tempErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!inviteData.email.trim()) {
      tempErrors.email = 'Email address is required';
    } else if (!emailRegex.test(inviteData.email)) {
      tempErrors.email = 'Invalid email address';
    }
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSendInvite = (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSending(true);
    setTimeout(async () => {
      showToast.success(`Invitation link dispatched to ${inviteData.email}!`);
      await activityService.create('Invite Operator', `Dispatched console invite token to ${inviteData.email} (${inviteData.role})`, currentUser.name);
      setInviteData({
        email: '',
        role: 'Driver',
        message: 'Hello, you have been invited to join TransitOps Logistics ERP. Please register your console credentials.'
      });
      setIsSending(false);
    }, 600);
  };

  const handleCopyLink = () => {
    const inviteLink = `https://transitops.com/join?token=mock-token-${Date.now()}`;
    navigator.clipboard.writeText(inviteLink);
    setCopiedLink(true);
    showToast.success('Invite link copied to clipboard');
    setTimeout(() => setCopiedLink(false), 2000);
  };

  if (!isAdmin) {
    return (
      <PageContainer>
        <div className="bg-card border border-border p-8 rounded-lg shadow-sm text-center select-none space-y-3">
          <Shield size={40} className="mx-auto text-danger" />
          <h3 className="text-base font-black text-text-main uppercase">Access Denied</h3>
          <p className="text-text-secondary text-xs max-w-sm mx-auto leading-relaxed">
            You do not possess the required Security Clearance to dispatch console join invitations.
          </p>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="space-y-6 select-none text-left max-w-2xl">
        
        <div className="bg-card border border-border rounded-xl p-5 space-y-5">
          <h4 className="text-[11px] font-black text-text-main uppercase tracking-wider flex items-center gap-2 border-b border-border/60 pb-2">
            <UserPlus size={15} className="text-info" /> Dispatch Console Invite
          </h4>

          <form onSubmit={handleSendInvite} className="space-y-4 text-xs font-semibold text-text-secondary">
            
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase font-bold text-text-secondary">Operator Email Address</label>
              <div className="relative">
                <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
                <input
                  type="email"
                  value={inviteData.email}
                  onChange={e => handleInputChange('email', e.target.value)}
                  placeholder="name@transitops.com"
                  className="w-full pl-9 pr-4 py-2 bg-background text-text-main border border-border rounded-lg focus:outline-none focus:border-info"
                />
              </div>
              {errors.email && <p className="text-danger text-[10px]">{errors.email}</p>}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase font-bold text-text-secondary">Console Access Role</label>
              <select
                value={inviteData.role}
                onChange={e => handleInputChange('role', e.target.value)}
                className="bg-background text-text-main border border-border rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-info"
              >
                <option value="Admin">Admin</option>
                <option value="Fleet Manager">Fleet Manager</option>
                <option value="Safety Officer">Safety Officer</option>
                <option value="Financial Analyst">Financial Analyst</option>
                <option value="Driver">Driver</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase font-bold text-text-secondary">Invitation Message</label>
              <textarea
                value={inviteData.message}
                onChange={e => handleInputChange('message', e.target.value)}
                rows={3}
                className="bg-background text-text-main border border-border rounded-lg px-3 py-2 focus:outline-none focus:border-info"
              />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <Button variant="info" type="submit" loading={isSending} className="flex-1 font-bold flex items-center justify-center gap-1.5">
                <Send size={13} /> Dispatch Email Invite
              </Button>
              <Button
                variant="outline"
                type="button"
                onClick={handleCopyLink}
                className="font-bold flex items-center justify-center gap-1.5 border-border text-text-main"
              >
                {copiedLink ? <Check size={13} className="text-success" /> : <Copy size={13} />}
                <span>{copiedLink ? 'Copied' : 'Copy Link'}</span>
              </Button>
            </div>

          </form>
        </div>

      </div>
    </PageContainer>
  );
};

export default InviteUser;
