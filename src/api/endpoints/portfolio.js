/*
import api from '../client';

export const portfolioApi = {
  // Putanje koje je backend lead potvrdio
  getClientAssets: (clientId) => api.get(`/client/${clientId}/assets`),
  getActuaryAssets: (actId) => api.get(`/actuary/${actId}/assets`),
  
  // Akcija za OTC (Admin/Supervisor)
  makePublic: (assetId, amount) => api.post(`/portfolio/make-public`, { assetId, amount }),
  
  // Akcija za Exercise (Aktuar)
  exerciseOption: (optionId) => api.post(`/portfolio/exercise/${optionId}`)
};
*/
import api from '../client';

export const portfolioApi = {
  // Mora biti /client/ID/assets, nikako /portfolio/client/ID
  getClientPortfolio: (clientId) => api.get(`/client/${clientId}/assets`),
  
  // Za aktuara (zaposlenog)
  getActuaryPortfolio: (actId) => api.get(`/actuary/${actId}/assets`),
};