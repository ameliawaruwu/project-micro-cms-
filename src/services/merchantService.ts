import { SalesAnalytics, TimeFilter, Order, Product } from '../types';
import { orderService } from './orderService';
import { productService } from './productService';

export const merchantService = {
  async getDashboardAnalytics(storeId: string, period: TimeFilter = 'Hari Ini'): Promise<SalesAnalytics & { peakLabel?: string; peakAmount?: number }> {
    let totalSales = 8638000;
    let salesGrowth = 12.5;
    let orderCount = 25;
    let averageOrderValue = 345520;
    let chartData: { label: string; sales: number; orders: number }[] = [];
    let peakLabel = '12:00';
    let peakAmount = 2350000;

    if (period === 'Hari Ini') {
      totalSales = 8638000;
      salesGrowth = 12.5;
      orderCount = 25;
      averageOrderValue = 345520;
      peakLabel = '12:00';
      peakAmount = 2350000;
      chartData = [
        { label: '08:00', sales: 1200000, orders: 3 },
        { label: '10:00', sales: 1800000, orders: 5 },
        { label: '12:00', sales: 2350000, orders: 7 },
        { label: '14:00', sales: 1400000, orders: 4 },
        { label: '16:00', sales: 1100000, orders: 3 },
        { label: '18:00', sales: 588000, orders: 2 },
        { label: '20:00', sales: 200000, orders: 1 },
      ];
    } else if (period === '7 Hari') {
      totalSales = 45238000;
      salesGrowth = 8.2;
      orderCount = 134;
      averageOrderValue = 337597;
      peakLabel = 'Sabtu';
      peakAmount = 9400000;
      chartData = [
        { label: 'Sen', sales: 4200000, orders: 12 },
        { label: 'Sel', sales: 5800000, orders: 18 },
        { label: 'Rab', sales: 3900000, orders: 11 },
        { label: 'Kam', sales: 7100000, orders: 21 },
        { label: 'Jum', sales: 8638000, orders: 25 },
        { label: 'Sab', sales: 9400000, orders: 28 },
        { label: 'Min', sales: 6200000, orders: 19 },
      ];
    } else if (period === '30 Hari') {
      totalSales = 119400000;
      salesGrowth = 15.4;
      orderCount = 389;
      averageOrderValue = 306940;
      peakLabel = 'Minggu ke-4';
      peakAmount = 34800000;
      chartData = [
        { label: 'Mgg 1', sales: 24500000, orders: 80 },
        { label: 'Mgg 2', sales: 31200000, orders: 102 },
        { label: 'Mgg 3', sales: 28900000, orders: 95 },
        { label: 'Mgg 4', sales: 34800000, orders: 112 },
      ];
    } else {
      totalSales = 856400000;
      salesGrowth = 22.8;
      orderCount = 2630;
      averageOrderValue = 325627;
      peakLabel = 'Kuartal 4 (Q4)';
      peakAmount = 261400000;
      chartData = [
        { label: 'Q1', sales: 185000000, orders: 580 },
        { label: 'Q2', sales: 212000000, orders: 650 },
        { label: 'Q3', sales: 198000000, orders: 610 },
        { label: 'Q4', sales: 261400000, orders: 790 },
      ];
    }

    return {
      period,
      totalSales,
      salesGrowth,
      orderCount,
      averageOrderValue,
      chartData,
      peakLabel,
      peakAmount,
    };
  },

  async getLowStockProducts(storeId: string): Promise<Product[]> {
    const products = await productService.getProductsByStore(storeId);
    return products.filter((p) => p.stock <= 5);
  },

  async getRecentOrders(storeId: string, limit = 5): Promise<Order[]> {
    const orders = await orderService.getOrdersByStore(storeId);
    return orders.slice(0, limit);
  },
};
