export const AlertsMsg = ({ alert }: { alert: string }) => {

  if (alert === 'success_token') {
    return {"alertMessage": 'Email verified successfully! You can now sign in.',
    "alertType": 'success'};
  } else if (alert === 'missing_token') {
    return {'alertMessage': 'Verification token is missing.',
    'alertType': 'error'};
  } else if (alert === 'invalid_token') {
    return {'alertMessage': 'Invalid verification token.',
    'alertType': 'error'};
  } else if (alert === 'expired_token') {
    return {'alertMessage': 'Verification token has expired.',
    'alertType': 'error'};
  } else if (alert === 'success_signup') {
    return {'alertMessage': 'Account created successfully! Please verify your email to sign in.',
    'alertType':'success'};
  } else if (alert === 'email_exists') {
    return {'alertMessage': 'Email already exists. Please login or use a different email.',
    'alertType': 'error'};
  } else if (alert === 'invalid_email') {
    return {'alertMessage': 'Invalid email format. Please enter a valid email address.',
    'alertType': 'error'};
  } else if (alert === 'password_mismatch') {
    return {'alertMessage': 'Passwords do not match. Please enter the same password in both fields.',
    'alertType': 'error'};
  } else if (alert === 'password_short') {
    return {'alertMessage': 'Password must be at least 8 characters long.',
    'alertType': 'error'};
  } else if (alert === 'invalid_login') {
    return {'alertMessage': 'Invalid email or password. Please try again.',
    'alertType': 'error'};
  } else if (alert === 'error_signup') {
    return {'alertMessage': 'An error occurred while creating your account. Please try again later.',
      'alertType': 'error'};
  }else if (alert === 'error_post_ad') {
    return {'alertMessage': 'An error occurred while posting your ad. Please try again later.',
      'alertType': 'error'};
  }else if (alert === 'success_ad_post') {
    return {'alertMessage': 'Your ad has been posted successfully!',
      'alertType': 'success'};
  }
};