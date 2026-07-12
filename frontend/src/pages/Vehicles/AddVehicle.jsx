import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AddVehicle = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to the main registry view and trigger the modal opening
    navigate('/vehicles?add=true', { replace: true });
  }, [navigate]);

  return (
    <div className="flex items-center justify-center h-[50vh]">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-info" />
    </div>
  );
};

export default AddVehicle;
