import { appConfig } from '@/src/config/appConfig';
import {
  AttorneyDto,
  AttorneySubjectDto,
  AttorneyListResponseDto,
  AttorneySubjectsResponseDto,
  CreateAttorneyRequestDto,
  CreateAttorneyResponseDto,
  RevokeAttorneyResponseDto,
} from '@/src/features/attorney/api/contracts';
import { Attorney, AttorneySubject, CreateAttorneyPayload } from '@/src/features/attorney/types';
import { createApiClient } from '@/src/shared/api/apiClient';
import { authStore } from '@/src/store/useAuthStore';

function formatDate(date: Date): string {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
}

function parseApiError(message: string | null): string {
  if (!message) return 'Bir hata oluştu.';
  const match = message.match(/under code '(.+?)' for locale/);
  return match ? match[1] : message;
}

function mapSubjectDto(dto: AttorneySubjectDto): AttorneySubject {
  return { id: dto.allowedSubjectId, name: dto.subject };
}

function mapAttorneyDto(dto: AttorneyDto): Attorney {
  return {
    id: dto.attorneyId,
    receiverEmail: dto.receiverEmail,
    giverEmail: dto.giverEmail,
    startDate: dto.startDate,
    endDate: dto.endDate,
    allSubjects: dto.allSubjects,
    subjects: (dto.subjects ?? []).map(mapSubjectDto),
    active: dto.active,
    deleted: dto.deleted,
  };
}

function mapCreatePayloadToDto(payload: CreateAttorneyPayload): CreateAttorneyRequestDto {
  return {
    receiverEmail: payload.receiverEmail.trim().toLowerCase(),
    startDate: formatDate(payload.startDate),
    endDate: formatDate(payload.endDate),
    allSubjects: payload.allSubjects,
    allowedSubjectIds: payload.allSubjects ? null : payload.selectedSubjectIds,
  };
}

export interface AttorneyService {
  getSubjects(): Promise<AttorneySubject[]>;
  getAttorneys(): Promise<{ current: Attorney[]; history: Attorney[] }>;
  createAttorney(payload: CreateAttorneyPayload): Promise<Attorney>;
  revokeAttorney(id: string): Promise<void>;
}

const apiClient = createApiClient(appConfig.api.baseUrl);

function authHeaders(): Record<string, string> {
  const token = authStore.getState().session?.accessToken;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export const attorneyService: AttorneyService = {
  async getSubjects() {
    const res = await apiClient.request<AttorneySubjectsResponseDto>(
      '/mos/api/v3/attorneySubjects',
      { headers: authHeaders() },
    );
    if (res.code !== 200) throw new Error(parseApiError(res.message));
    return (res.data ?? []).map(mapSubjectDto);
  },

  async getAttorneys() {
    const res = await apiClient.request<AttorneyListResponseDto>(
      '/mos/api/v3/attorneyV2',
      { headers: authHeaders() },
    );
    if (res.code !== 200) throw new Error(parseApiError(res.message));
    const data = res.data ?? { currentAttorneys: [], history: [] };
    return {
      current: data.currentAttorneys.map(mapAttorneyDto),
      history: data.history.map(mapAttorneyDto),
    };
  },

  async createAttorney(payload: CreateAttorneyPayload) {
    const res = await apiClient.request<CreateAttorneyResponseDto>(
      '/mos/api/v3/CreateAttorneyV2',
      { method: 'POST', body: mapCreatePayloadToDto(payload), headers: authHeaders() },
    );
    if (res.code !== 200) throw new Error(parseApiError(res.message));
    if (!res.data) throw new Error('Sunucu geçersiz yanıt döndürdü.');
    return mapAttorneyDto(res.data);
  },

  async revokeAttorney(id: string) {
    const encodedId = encodeURIComponent(btoa(id));
    const res = await apiClient.request<RevokeAttorneyResponseDto>(
      `/mos/api/v3/DeleteAttorney/${encodedId}`,
      { headers: authHeaders() },
    );
    if (res.code !== 200) throw new Error(parseApiError(res.message));
  },
};
