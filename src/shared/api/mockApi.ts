import { DUMMY_DATA } from './mockData';

// Gecikme süresi (ms)
const DELAY = 400;

export const mockApi = {
  // Tüm talepleri getir
  getRequests: async () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(DUMMY_DATA);
      }, DELAY);
    });
  },

  // Talep onaylama/reddetme simülasyonu
  processAction: async (ids: string[], action: 'APPROVE' | 'REJECT') => {
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log(`Backend İşlemi: ${action} | Hedef ID'ler:`, ids);
        resolve({ success: true });
      }, DELAY);
    });
  }
};