import toast from 'react-hot-toast';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastOptions {
  message: string;
  type: ToastType;
}

/**
 * Show a toast notification based on alert type and message
 */
export const showToast = ({ message, type }: ToastOptions): void => {
  switch (type) {
    case 'success':
      toast.success(message);
      break;
    case 'error':
      toast.error(message);
      break;
    case 'warning':
      toast(message, {
        icon: '⚠️',
        style: {
          border: '1px solid #f59e0b',
          borderLeft: '8px solid #f59e0b',
        },
      });
      break;
    case 'info':
      toast(message, {
        icon: 'ℹ️',
        style: {
          border: '1px solid #3b82f6',
          borderLeft: '8px solid #3b82f6',
        },
      });
      break;
  }
};

/**
 * Show a toast notification based on alert code
 */
export const showAlertToast = (alertCode: string) => {
  const alertInfo = getAlertInfo(alertCode);
  if (alertInfo) {
    showToast(alertInfo);
    return true;
  }
  return false;
};

/**
 * Get alert information based on alert code
 */
export const getAlertInfo = (alertCode: string) => {
  const alerts: Record<string, { message: string; type: ToastType }> = {
    'success_token': {
      message: 'Email verified successfully! You can now sign in.',
      type: 'success'
    },
    'missing_token': {
      message: 'Verification token is missing.',
      type: 'error'
    },
    'invalid_token': {
      message: 'Invalid verification token.',
      type: 'error'
    },
    'expired_token': {
      message: 'Verification token has expired.',
      type: 'error'
    },
    'success_signup': {
      message: 'Account created successfully! Please verify your email to sign in.',
      type: 'success'
    },
    'email_exists': {
      message: 'Email already exists. Please login or use a different email.',
      type: 'error'
    },
    'invalid_email': {
      message: 'Invalid email format. Please enter a valid email address.',
      type: 'error'
    },
    'password_mismatch': {
      message: 'Passwords do not match. Please enter the same password in both fields.',
      type: 'error'
    },
    'password_short': {
      message: 'Password must be at least 8 characters long.',
      type: 'error'
    },
    'invalid_login': {
      message: 'Invalid email or password. Please try again.',
      type: 'error'
    },
    'error_signup': {
      message: 'An error occurred while creating your account. Please try again later.',
      type: 'error'
    },
    'error_post_ad': {
      message: 'An error occurred while posting your ad. Please try again later.',
      type: 'error'
    },
    'success_ad_post': {
      message: 'Your ad has been posted successfully!',
      type: 'success'
    }
  };

  return alerts[alertCode];
};
