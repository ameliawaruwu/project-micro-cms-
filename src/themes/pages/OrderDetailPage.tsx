import React from 'react';
import { OrdersPage } from './OrdersPage';

export const OrderDetailPage: React.FC<any> = (props) => {
  return <OrdersPage {...props} isDetailView={true} />;
};
