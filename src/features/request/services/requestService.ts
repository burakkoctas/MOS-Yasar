import { appConfig } from '@/src/config/appConfig';
import {
  RequestActionDto,
  RequestCategoryDto,
  RequestItemDto,
  RequestListQueryDto,
} from '@/src/features/request/api/contracts';
import {
  CategoryGroup,
  RequestDateRange,
  RequestItem,
  RequestQuery,
} from '@/src/features/request/types';
import { createApiClient } from '@/src/shared/api/apiClient';
import { DUMMY_DATA } from '@/src/shared/api/mockData';

const DELAY = 250;

function wait() {
  return new Promise((resolve) => setTimeout(resolve, DELAY));
}

function cloneGroups(groups: CategoryGroup[]): CategoryGroup[] {
  return groups.map((group) => ({
    ...group,
    data: group.data.map((item) => ({ ...item })),
  }));
}

function parseTurkishDate(value?: string) {
  if (!value || value === '-') {
    return null;
  }

  const [day, month, year] = value.split('.').map(Number);

  if (!day || !month || !year) {
    return null;
  }

  return new Date(year, month - 1, day);
}

function formatTurkishDate(date: Date) {
  return date.toLocaleDateString('tr-TR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function isInRange(date: Date | null, range?: RequestDateRange | null) {
  if (!range) {
    return true;
  }

  if (!date) {
    return false;
  }

  return date >= range.start && date <= range.end;
}

function createRequestDetails(item: RequestItem): RequestItem {
  return {
    ...item,
    isim: item.gonderen,
    tarih: item.baslangic,
    belgeNo: `BEL-${item.istekNo}`,
    acilis: item.baslangic,
    modul: item.modul ?? 'SAP Workflow',
    kategori: item.kategori ?? item.sirket,
    aciklama:
      item.aciklama ??
      `${item.gonderen} tarafindan olusturulan ${item.kategori ?? item.sirket} talebi icin onay bekleniyor.`,
  };
}

function mapRequestDtoToDomain(item: RequestItemDto): RequestItem {
  return {
    id: item.id,
    istekNo: item.requestNo,
    gonderen: item.senderName,
    sirket: item.companyName,
    statu: item.workflowStatus,
    baslangic: item.startDate,
    bitis: item.endDate,
    onayDurumu: item.approvalStatus,
    isim: item.displayName,
    belgeNo: item.documentNo,
    modul: item.moduleName,
    kategori: item.categoryName,
    aciklama: item.description,
  };
}

function mapCategoryDtoToDomain(category: RequestCategoryDto): CategoryGroup {
  return {
    category: category.categoryName,
    data: category.items.map(mapRequestDtoToDomain),
  };
}

function mapQueryToDto(query?: RequestQuery): RequestListQueryDto {
  return {
    startDate: query?.range?.start ? formatTurkishDate(query.range.start) : undefined,
    endDate: query?.range?.end ? formatTurkishDate(query.range.end) : undefined,
  };
}

function mapActionToDto(ids: string[], action: 'APPROVE' | 'REJECT'): RequestActionDto {
  return { ids, action };
}

const mockGroups = cloneGroups(DUMMY_DATA as CategoryGroup[]);

export interface RequestService {
  getRequests(): Promise<CategoryGroup[]>;
  getRequestHistory(query?: RequestQuery): Promise<CategoryGroup[]>;
  getRequestById(id: string): Promise<RequestItem | null>;
  processAction(ids: string[], action: 'APPROVE' | 'REJECT'): Promise<void>;
}

const mockRequestService: RequestService = {
  async getRequests(): Promise<CategoryGroup[]> {
    await wait();
    return cloneGroups(mockGroups);
  },

  async getRequestHistory(query?: RequestQuery): Promise<CategoryGroup[]> {
    await wait();

    return cloneGroups(mockGroups)
      .map((group) => ({
        ...group,
        data: group.data.filter((item) =>
          isInRange(parseTurkishDate(item.baslangic), query?.range),
        ),
      }))
      .filter((group) => group.data.length > 0);
  },

  async getRequestById(id: string): Promise<RequestItem | null> {
    await wait();

    for (const group of mockGroups) {
      const match = group.data.find((item) => item.id === id);
      if (match) {
        return createRequestDetails({
          ...match,
          kategori: group.category,
        });
      }
    }

    return null;
  },

  async processAction(ids: string[], action: 'APPROVE' | 'REJECT'): Promise<void> {
    await wait();

    const nextStatus = action === 'APPROVE' ? 'Onaylandı' : 'Reddedildi';

    mockGroups.forEach((group) => {
      group.data = group.data.map((item) =>
        ids.includes(item.id)
          ? {
              ...item,
              onayDurumu: nextStatus,
              statu: nextStatus,
            }
          : item,
      );
    });
  },
};

const apiClient = createApiClient(appConfig.api.baseUrl);

const remoteRequestService: RequestService = {
  async getRequests() {
    const response = await apiClient.request<RequestCategoryDto[]>('/requests');
    return response.map(mapCategoryDtoToDomain);
  },

  async getRequestHistory(query?: RequestQuery) {
    const queryDto = mapQueryToDto(query);
    const queryString = new URLSearchParams(
      Object.entries(queryDto).filter(([, value]) => Boolean(value)) as [string, string][],
    ).toString();
    const path = queryString ? `/requests/history?${queryString}` : '/requests/history';
    const response = await apiClient.request<RequestCategoryDto[]>(path);
    return response.map(mapCategoryDtoToDomain);
  },

  async getRequestById(id: string) {
    const response = await apiClient.request<RequestItemDto>(`/requests/${id}`);
    return createRequestDetails(mapRequestDtoToDomain(response));
  },

  async processAction(ids: string[], action: 'APPROVE' | 'REJECT') {
    await apiClient.request('/requests/actions', {
      method: 'POST',
      body: mapActionToDto(ids, action),
    });
  },
};

export const requestService: RequestService =
  appConfig.api.mode === 'remote' ? remoteRequestService : mockRequestService;

export function parseDateRangeText(rangeText: string): RequestDateRange | null {
  const [rawStart, rawEnd] = rangeText.split(' - ');

  if (!rawStart || !rawEnd) {
    return null;
  }

  const start = parseTurkishDate(rawStart);
  const end = parseTurkishDate(rawEnd);

  if (!start || !end) {
    return null;
  }

  return {
    start,
    end,
  };
}
