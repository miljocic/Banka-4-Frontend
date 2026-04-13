import { bankingApi, tradingApi } from '../client';

export const exchangeApi = {
    getRates: () => bankingApi.get('/exchange/rates'),
    calculate: (params) => bankingApi.get('/exchange/calculate', { params }),
};

export const stockExchangeApi = {
    getAll: (params = {}) => tradingApi.get('/exchanges', { params }),
    toggle: (micCode) => tradingApi.patch(`/exchanges/${micCode}/toggle`),
};
