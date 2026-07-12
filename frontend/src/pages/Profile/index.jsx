import React from 'react';

const Profile = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-main">User Profile</h1>
        <p className="text-sm text-text-secondary">View and modify your operator profile settings.</p>
      </div>
      <div className="bg-card border border-border p-8 rounded-lg shadow-sm text-center">
        <p className="text-text-secondary">Profile avatar editor, credentials update form, and action permissions will render here in Phase 2.</p>
      </div>
    </div>
  );
};

export default Profile;
