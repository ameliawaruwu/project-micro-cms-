import React from 'react';
import { ShopPage } from './ShopPage';

export const WishlistPage: React.FC<any> = (props) => {
  return <ShopPage {...props} isWishlist={true} />;
};
