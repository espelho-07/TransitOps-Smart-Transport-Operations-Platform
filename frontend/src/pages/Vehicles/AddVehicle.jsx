import React from 'react';
import Card from '../../components/Card';
import Button from '../../components/Button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AddVehicle = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="outline" size="sm" onClick={() => navigate('/vehicles')} icon={ArrowLeft}>
          Back to Inventory
        </Button>
      </div>

      <Card title="Vehicle Registration Details" subtitle="Enter carrier license parameters, year, make, and tonnage details.">
        <div className="p-8 text-center text-text-secondary border border-dashed border-border rounded-lg">
          Add Vehicle Form interface will render here in Phase 2 feature modules.
        </div>
      </Card>
    </div>
  );
};

export default AddVehicle;
