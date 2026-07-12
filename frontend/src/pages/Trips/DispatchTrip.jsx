import React from 'react';
import Card from '../../components/Card';
import Button from '../../components/Button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const DispatchTrip = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="outline" size="sm" onClick={() => navigate('/trips')} icon={ArrowLeft}>
          Back to Trip Board
        </Button>
      </div>

      <Card title="New Cargo Dispatch Parameters" subtitle="Assign carrier trucks, active operators, origin/destination coordinates, and load capacities.">
        <div className="p-8 text-center text-text-secondary border border-dashed border-border rounded-lg">
          Dispatch Trip Form interface will render here in Phase 2 feature modules.
        </div>
      </Card>
    </div>
  );
};

export default DispatchTrip;
