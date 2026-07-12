import React from 'react';
import Modal from './Modal';
import Button from './Button';
import { AlertTriangle, Info, CheckCircle } from 'lucide-react';

const ConfirmationDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Are you sure?',
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'warning', // warning, danger, success, info
  isLoading = false
}) => {
  const icons = {
    warning: <AlertTriangle className="text-warning h-6 w-6" />,
    danger: <AlertTriangle className="text-danger h-6 w-6" />,
    success: <CheckCircle className="text-success h-6 w-6" />,
    info: <Info className="text-info h-6 w-6" />
  };

  const confirmVariants = {
    warning: 'primary',
    danger: 'danger',
    success: 'primary',
    info: 'primary'
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm" closeOnOverlayClick={!isLoading}>
      <div className="space-y-6">
        <div className="flex gap-4 items-start">
          <div className="flex-shrink-0 p-2 bg-hover rounded-lg">
            {icons[type]}
          </div>
          <div className="space-y-1">
            <p className="text-sm text-text-secondary leading-relaxed">
              {message}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
          >
            {cancelText}
          </Button>
          <Button
            variant={confirmVariants[type]}
            onClick={onConfirm}
            isLoading={isLoading}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmationDialog;
