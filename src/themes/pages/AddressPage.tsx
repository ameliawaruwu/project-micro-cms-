import React from 'react';
import { ProfilePage } from './ProfilePage';

export const AddressPage: React.FC<any> = (props) => {
  return <ProfilePage {...props} tab="address" />;
};
