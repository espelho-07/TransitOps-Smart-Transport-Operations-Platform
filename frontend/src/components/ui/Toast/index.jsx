import toast from 'react-hot-toast';

/**
 * Reusable Toast helper utility mapping to react-hot-toast.
 */
export const showToast = {
  success: (message) => {
    toast.success(message, {
      style: {
        background: 'var(--card)',
        color: 'var(--text-main)',
        border: '1px solid var(--border)',
        borderRadius: '10px',
        fontSize: '13px',
        fontWeight: '600'
      },
      iconTheme: {
        primary: 'var(--success)',
        secondary: 'var(--card)'
      }
    });
  },
  error: (message) => {
    toast.error(message, {
      style: {
        background: 'var(--card)',
        color: 'var(--text-main)',
        border: '1px solid var(--border)',
        borderRadius: '10px',
        fontSize: '13px',
        fontWeight: '600'
      },
      iconTheme: {
        primary: 'var(--danger)',
        secondary: 'var(--card)'
      }
    });
  },
  info: (message, icon = 'ℹ️') => {
    toast(message, {
      style: {
        background: 'var(--card)',
        color: 'var(--text-main)',
        border: '1px solid var(--border)',
        borderRadius: '10px',
        fontSize: '13px',
        fontWeight: '600'
      },
      icon: icon
    });
  }
};

export default showToast;
export { toast };
