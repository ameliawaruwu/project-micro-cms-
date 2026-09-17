import React from 'react';
import { LoginPage } from './LoginPage';

export const ForgotPasswordPage: React.FC<any> = (props) => {
  return <LoginPage {...props} mode="forgot_password" />;
};
