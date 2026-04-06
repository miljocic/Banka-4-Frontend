import {tradingApi} from '../client';

export const ordersApi = {
  getSupervisorOrders(params = {}) {
    return tradingApi.get('/orders', { params });
  },

  approveOrder(orderId) {
    return tradingApi.patch(`/orders/${orderId}/approve`);
  },

  declineOrder(orderId, payload = {}) {
    return tradingApi.patch(`/orders/${orderId}/decline`);
  },

  cancelOrder(orderId, payload = {}) {
    return tradingApi.patch(`/orders/${orderId}/cancel`);
  },
};