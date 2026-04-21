import { appConfig } from '@/src/config/appConfig';
import {
  CreateDelegateRequestDto,
  DelegateDto,
  DelegateListResponseDto,
} from '@/src/features/delegate/api/contracts';
import { CreateDelegatePayload, Delegate } from '@/src/features/delegate/types';
import { createApiClient } from '@/src/shared/api/apiClient';

const activeDelegates: Delegate[] = [
  {
    id: '1',
    email: 'ahmet.yilmaz@yasarbilgi.com.tr',
    startDate: '15.04.2026',
    endDate: '20.04.2026',
    titles: 'Tümü',
  },
  {
    id: '2',
    email: 'uzun.isimli.bir.personel@yasarbilgi.com.tr',
    startDate: '10.04.2026',
    endDate: 'Süresiz',
    titles: 'Dijital.Proje, Akdem, ATF',
  },
];

const pastDelegates: Delegate[] = [
  {
    id: '101',
    email: 'eski.calisan@sirket.com',
    startDate: '01.01.2026',
    endDate: '15.01.2026',
    titles: 'Genel Onay Yetkisi',
  },
  {
    id: '102',
    email: 'yonetici.yedek@pinarsut.com.tr',
    startDate: '10.02.2026',
    endDate: '20.02.2026',
    titles: 'Satın Alma Onayları, Masraf Merkezi Yetkileri',
  },
];

function formatDate(date: Date) {
  return date.toLocaleDateString('tr-TR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function mapDelegateDtoToDomain(delegate: DelegateDto): Delegate {
  return {
    id: delegate.id,
    email: delegate.email,
    startDate: delegate.startDate,
    endDate: delegate.endDate,
    titles: delegate.titles,
  };
}

function mapCreateDelegatePayloadToDto(
  payload: CreateDelegatePayload,
): CreateDelegateRequestDto {
  return {
    email: payload.email.trim().toLowerCase(),
    startDate: formatDate(payload.startDate),
    endDate: formatDate(payload.endDate),
    scope: payload.scope,
    titles: payload.selectedTitles,
  };
}

export interface DelegateService {
  getActiveDelegates(): Promise<Delegate[]>;
  getPastDelegates(): Promise<Delegate[]>;
  createDelegate(payload: CreateDelegatePayload): Promise<Delegate>;
  revokeDelegate(id: string): Promise<void>;
}

const mockDelegateService: DelegateService = {
  async getActiveDelegates(): Promise<Delegate[]> {
    return activeDelegates.map((delegate) => ({ ...delegate }));
  },

  async getPastDelegates(): Promise<Delegate[]> {
    return pastDelegates.map((delegate) => ({ ...delegate }));
  },

  async createDelegate(payload: CreateDelegatePayload): Promise<Delegate> {
    if (!payload.email.includes('@')) {
      throw new Error('Geçerli bir e-posta adresi girin.');
    }

    if (payload.endDate < payload.startDate) {
      throw new Error('Bitiş tarihi başlangıç tarihinden önce olamaz.');
    }

    if (payload.scope === 'SELECT' && payload.selectedTitles.length === 0) {
      throw new Error('Seçili kapsam için en az bir başlık seçin.');
    }

    const createdDelegate: Delegate = {
      id: `${Date.now()}`,
      email: payload.email.trim().toLowerCase(),
      startDate: formatDate(payload.startDate),
      endDate: formatDate(payload.endDate),
      titles: payload.scope === 'ALL' ? 'Tümü' : payload.selectedTitles.join(', '),
    };

    activeDelegates.unshift(createdDelegate);

    return createdDelegate;
  },

  async revokeDelegate(id: string): Promise<void> {
    const index = activeDelegates.findIndex((delegate) => delegate.id === id);

    if (index >= 0) {
      const [removed] = activeDelegates.splice(index, 1);
      pastDelegates.unshift(removed);
    }
  },
};

const apiClient = createApiClient(appConfig.api.baseUrl);

const remoteDelegateService: DelegateService = {
  async getActiveDelegates() {
    const response = await apiClient.request<DelegateListResponseDto>('/delegates/active');
    return response.items.map(mapDelegateDtoToDomain);
  },

  async getPastDelegates() {
    const response = await apiClient.request<DelegateListResponseDto>('/delegates/past');
    return response.items.map(mapDelegateDtoToDomain);
  },

  async createDelegate(payload: CreateDelegatePayload) {
    const response = await apiClient.request<{ item: DelegateDto }>('/delegates', {
      method: 'POST',
      body: mapCreateDelegatePayloadToDto(payload),
    });
    return mapDelegateDtoToDomain(response.item);
  },

  async revokeDelegate(id: string) {
    await apiClient.request(`/delegates/${id}`, {
      method: 'DELETE',
    });
  },
};

export const delegateService: DelegateService =
  appConfig.api.mode === 'remote' ? remoteDelegateService : mockDelegateService;
