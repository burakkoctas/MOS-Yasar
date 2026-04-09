// Gerçek backend gelene kadar bizi idare edecek simülasyon servisi
import { DUMMY_DATA } from './mockData'; // Eski data.ts'i buraya taşıyabilirsin

export const mockApi = {
  getRequests: async () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(DUMMY_DATA);
      }, 1500); // 1.5 saniye ağ gecikmesi simülasyonu
    });
  },
  // İleride deleteRequest, approveRequest vb. eklenecek
};