import React, { useState } from 'react';
import {
  User,
  Phone,
  Mail,
  ShieldAlert,
  Camera,
  Save,
  Lock
} from 'lucide-react';
import PageContainer from '../../components/ui/PageContainer';
import Button from '../../components/ui/Button';
import ImageUpload from '../../components/ui/ImageUpload';
import { DriverAvatar } from '../../components/ui/FallbackImage';
import { useAuth } from '../../context/AuthContext';
import { showToast } from '../../components/ui/Toast';

const Profile = () => {
  const { currentUser, updateContactInfo, updateProfileImage, updateCoverImage } = useAuth();

  const [formData, setFormData] = useState({
    name: currentUser?.name || '',
    email: currentUser?.email || '',
    phone: currentUser?.phone || '+1 (555) 234-5678',
    emergencyContact: currentUser?.emergencyContact || 'Emergency Contact (+1 555-987-6543)',
    address: currentUser?.address || '123 Smart Depot, Logistics City'
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [isSaving, setIsSaving] = useState(false);

  const handleInputChange = (field, val) => {
    setFormData(prev => ({ ...prev, [field]: val }));
  };

  const handleSaveContact = () => {
    setIsSaving(true);
    setTimeout(() => {
      updateContactInfo(formData.phone, formData.emergencyContact, formData.address);
      showToast.success('Contact credentials modified successfully!');
      setIsSaving(false);
    }, 400);
  };

  const handlePasswordReset = (e) => {
    e.preventDefault();
    if (!passwordForm.newPassword || !passwordForm.confirmPassword) {
      showToast.error('Please input password details');
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showToast.error('Passwords do not match');
      return;
    }
    showToast.success('Credentials security records updated!');
    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
  };

  return (
    <PageContainer>
      <div className="space-y-6 select-none text-left max-w-4xl">
        
        {/* Cover Photo & Avatar Header Banner */}
        <div className="bg-card border border-border rounded-2xl overflow-hidden relative shadow-sm">
          <div className="h-32 sm:h-40 bg-gradient-to-r from-info/20 via-info/30 to-info/10 relative">
            {currentUser?.coverImage && (
              <img
                src={currentUser.coverImage}
                alt="Profile cover banner"
                className="w-full h-full object-cover opacity-75"
              />
            )}
            
            {/* Absolute Change Cover overlay */}
            <div className="absolute top-3 right-3">
              <label className="bg-card/85 text-text-main px-3 py-1.5 rounded-lg border border-border text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer hover:bg-card">
                <Camera size={12} />
                <span>Upload cover</span>
                <input
                  type="file"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = () => {
                        updateCoverImage(reader.result);
                        showToast.success('Cover banner updated');
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                />
              </label>
            </div>
          </div>

          <div className="px-6 pb-6 pt-16 relative">
            
            {/* Avatar Absolute Pos */}
            <div className="absolute -top-16 left-6 border-4 border-card rounded-full overflow-hidden shadow-md bg-card">
              <DriverAvatar
                name={currentUser?.name}
                avatarUrl={currentUser?.avatar}
                size={96}
              />
              <label className="absolute bottom-0 right-0 p-1.5 bg-info text-white rounded-full cursor-pointer shadow hover:bg-info/90">
                <Camera size={13} />
                <input
                  type="file"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = () => {
                        updateProfileImage(reader.result);
                        showToast.success('Avatar image updated');
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                />
              </label>
            </div>

            <div>
              <h2 className="text-lg font-black text-text-main">{currentUser?.name}</h2>
              <span className="inline-block px-2.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-info/10 text-info mt-1.5">
                {currentUser?.role}
              </span>
            </div>
          </div>
        </div>

        {/* Details and security split cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Details form */}
          <div className="bg-card border border-border rounded-xl p-5 space-y-4">
            <h4 className="text-[11px] font-black text-text-main uppercase tracking-wider flex items-center gap-2 border-b border-border/60 pb-2">
              <User size={15} className="text-info" /> Profile details info
            </h4>

            <div className="space-y-4 text-xs font-semibold text-text-secondary">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] uppercase font-bold text-text-secondary">Full name</label>
                <input
                  type="text"
                  value={formData.name}
                  disabled
                  className="bg-hover/40 text-text-secondary border border-border rounded-lg px-3.5 py-1.5 cursor-not-allowed"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] uppercase font-bold text-text-secondary">Email address</label>
                <input
                  type="email"
                  value={formData.email}
                  disabled
                  className="bg-hover/40 text-text-secondary border border-border rounded-lg px-3.5 py-1.5 cursor-not-allowed"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] uppercase font-bold text-text-secondary">Mobile phone</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={e => handleInputChange('phone', e.target.value)}
                  className="bg-background text-text-main border border-border rounded-lg px-3.5 py-1.5 focus:outline-none focus:border-info"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] uppercase font-bold text-text-secondary">Emergency custody contact</label>
                <input
                  type="text"
                  value={formData.emergencyContact}
                  onChange={e => handleInputChange('emergencyContact', e.target.value)}
                  className="bg-background text-text-main border border-border rounded-lg px-3.5 py-1.5 focus:outline-none focus:border-info"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] uppercase font-bold text-text-secondary">Home/Office Address</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={e => handleInputChange('address', e.target.value)}
                  className="bg-background text-text-main border border-border rounded-lg px-3.5 py-1.5 focus:outline-none focus:border-info"
                />
              </div>

              <div className="pt-2 flex justify-end">
                <Button variant="info" size="sm" onClick={handleSaveContact} loading={isSaving} className="font-bold flex items-center gap-1.5">
                  <Save size={13} /> Update Profile
                </Button>
              </div>
            </div>
          </div>

          {/* Security Card */}
          <div className="bg-card border border-border rounded-xl p-5 space-y-4">
            <h4 className="text-[11px] font-black text-text-main uppercase tracking-wider flex items-center gap-2 border-b border-border/60 pb-2">
              <Lock size={15} className="text-info" /> Security settings
            </h4>

            <form onSubmit={handlePasswordReset} className="space-y-4 text-xs font-semibold text-text-secondary">
              
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] uppercase font-bold text-text-secondary">Current password</label>
                <input
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={e => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                  className="bg-background text-text-main border border-border rounded-lg px-3.5 py-1.5 focus:outline-none focus:border-info"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] uppercase font-bold text-text-secondary">New password</label>
                <input
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={e => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                  className="bg-background text-text-main border border-border rounded-lg px-3.5 py-1.5 focus:outline-none focus:border-info"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] uppercase font-bold text-text-secondary">Confirm new password</label>
                <input
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={e => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  className="bg-background text-text-main border border-border rounded-lg px-3.5 py-1.5 focus:outline-none focus:border-info"
                />
              </div>

              <div className="pt-2 flex justify-end">
                <Button variant="outline" type="submit" className="font-bold flex items-center gap-1.5 text-danger border-danger/25 hover:bg-danger/5">
                  Change Password
                </Button>
              </div>

            </form>
          </div>

        </div>

      </div>
    </PageContainer>
  );
};

export default Profile;
