import React from 'react';
import Card from '../../components/Card';
import Button from '../../components/Button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AddDriver = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="outline" size="sm" onClick={() => navigate('/drivers')} icon={ArrowLeft}>
          Back to Registry
        </Button>
      </div>

      <Card title="Driver Registration Details" subtitle="Input licensing data, contact details, and compliance credentials.">
        <div className="p-8 text-center text-text-secondary border border-dashed border-border rounded-lg">
          Add Driver Form interface will render here in Phase 2 feature modules.
        </div>
      </Card>
    </div>
  );
};

export default AddDriver;
