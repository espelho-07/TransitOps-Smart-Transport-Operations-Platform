import React from 'react';
import Modal from '../Modal';
import Button from '../Button';
import { AlertTriangle, ShieldAlert, CheckCircle, Info } from 'lucide-react';

/**
 * Reusable ConfirmDialog Modal.
 * @param {Object} props
 * @param {boolean} props.isOpen - Display status
 * @param {function} props.onClose - Cancel click callback
 * @param {function} props.onConfirm - Success click callback
 * @param {'warning'|'danger'|'success'|'info'} props.type - Semantic preset theme style
 */
const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Are you sure?',
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'warning',
  isLoading = false
}) => {
  const icons = {
    warning: <AlertTriangle className="text-warning h-6 w-6" />,
    danger: <ShieldAlert className="text-danger h-6 w-6" />,
    success: <CheckCircle className="text-success h-6 w-6" />,
    info: <Info className="text-info h-6 w-6" />
  };

  const confirmVariants = {
    warning: 'primary',
    danger: 'danger',
    success: 'success',
    info: 'primary'
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm" closeOnOverlayClick={!isLoading}>
      <div className="space-y-6">
        <div className="flex gap-4 items-start">
          <div className="flex-shrink-0 p-2 bg-hover rounded-lg">
            {icons[type] || icons.warning}
          </div>
          <div className="space-y-1.5 flex-1 min-w-0">
            <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
              {message}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-border/30 pt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={isLoading}
          >
            {cancelText}
          </Button>
          <Button
            variant={confirmVariants[type]}
            size="sm"
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

export default ConfirmDialog;
export { ConfirmDialog };
