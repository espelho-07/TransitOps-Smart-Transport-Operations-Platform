import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const DispatchTrip = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to list and launch dispatch modal
    navigate('/trips?dispatch=true', { replace: true });
  }, [navigate]);

  return (
    <div className="flex items-center justify-center h-[50vh]">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-info" />
    </div>
  );
};

export default DispatchTrip;
