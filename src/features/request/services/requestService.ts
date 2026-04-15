import { appConfig } from '@/src/config/appConfig';
import {
  RemoteRequestItemDto,
  RemoteRequestListResponseDto,
} from '@/src/features/request/api/contracts';
import {
  CategoryGroup,
  RequestDateRange,
  RequestItem,
  RequestQuery,
} from '@/src/features/request/types';
import { createApiClient } from '@/src/shared/api/apiClient';
import { DUMMY_DATA } from '@/src/shared/api/mockData';
import { authStore } from '@/src/store/useAuthStore';

const DELAY = 250;
const REMOTE_REQUESTS_BASE_URL = 'https://mos-tst.yasar.com.tr';
const GET_REQUESTS_SINGLE_PATH = '/mos/api/v3/GetRequestsSingle';

let remoteGroupsCache: CategoryGroup[] = [];

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
    tarih: item.tarih ?? item.baslangic,
    belgeNo: item.belgeNo ?? `BEL-${item.istekNo}`,
    acilis: item.acilis ?? item.baslangic,
    modul: item.modul ?? 'SAP Workflow',
    kategori: item.kategori ?? item.sirket,
    aciklama:
      item.aciklama ??
      `${item.gonderen} tarafindan olusturulan ${item.kategori ?? item.sirket} talebi icin onay bekleniyor.`,
  };
}

function normalizeSearchText(value: string) {
  return value
    .toLocaleLowerCase('tr-TR')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function parseDescriptionValue(lines: string[], labels: string[]) {
  const normalizedLabels = labels.map(normalizeSearchText);
  const matchedLine = lines.find((line) => {
    const [rawLabel] = line.split(':');
    return rawLabel ? normalizedLabels.includes(normalizeSearchText(rawLabel.trim())) : false;
  });

  if (!matchedLine) {
    return undefined;
  }

  const [, ...valueParts] = matchedLine.split(':');
  const value = valueParts.join(':').trim();
  return value || undefined;
}

function parseRequestDate(value?: string) {
  if (!value) {
    return '-';
  }

  const [datePart] = value.split(',');
  if (!datePart) {
    return value;
  }

  const [day, month, year] = datePart.split('-').map(Number);
  if (!day || !month || !year) {
    return datePart;
  }

  return `${String(day).padStart(2, '0')}.${String(month).padStart(2, '0')}.${year}`;
}

function deriveStatusText(item: RemoteRequestItemDto) {
  const normalizedOperationNames = item.operations.map((operation) =>
    operation.operationName.toLocaleLowerCase('tr-TR'),
  );

  if (normalizedOperationNames.some((name) => name.includes('onay'))) {
    return 'Onay Bekliyor';
  }

  if (normalizedOperationNames.some((name) => name.includes('ret'))) {
    return 'Islem Bekliyor';
  }

  return `Durum ${item.status}`;
}

function deriveApprovalStatus(item: RemoteRequestItemDto) {
  if (item.multipleApprove) {
    return 'Toplu Onaylanabilir';
  }

  if (item.approvalRequiresDescription) {
    return 'Aciklama Gerekli';
  }

  return 'Beklemede';
}

function mapRemoteRequestToDomain(item: RemoteRequestItemDto): RequestItem {
  const company =
    parseDescriptionValue(item.descriptionList, ['Sirket', 'Satis Org']) ??
    item.subSubject ??
    item.subject;
  const startDate =
    parseDescriptionValue(item.descriptionList, [
      'Aktivite Baslangic Tarihi',
      'Baslangic Tarihi',
      'Acilis Tarihi',
    ]) ?? parseRequestDate(item.requestDate);
  const endDate =
    parseDescriptionValue(item.descriptionList, ['Aktivite Bitis Tarihi', 'Bitis Tarihi']) ?? '-';
  const moduleName =
    parseDescriptionValue(item.descriptionList, ['Modul']) ?? item.subject;
  const categoryName =
    parseDescriptionValue(item.descriptionList, ['Kategori']) ?? item.subject;

  return {
    id: item.requestId,
    istekNo: item.referenceDocument,
    gonderen: item.requesterFullName,
    sirket: company,
    statu: deriveStatusText(item),
    baslangic: startDate,
    bitis: endDate,
    onayDurumu: deriveApprovalStatus(item),
    isim: item.requesterFullName,
    tarih: parseRequestDate(item.requestDate),
    belgeNo: item.referenceDocument,
    acilis: startDate,
    modul: moduleName,
    kategori: categoryName,
    aciklama: item.description,
  };
}

function mapRemoteResponseToGroups(items: RemoteRequestItemDto[]): CategoryGroup[] {
  const groupedRequests = new Map<string, RequestItem[]>();

  items.forEach((item) => {
    const category = item.subject?.trim() || 'Diger';
    const requestItem = mapRemoteRequestToDomain(item);
    const existingGroup = groupedRequests.get(category) ?? [];
    existingGroup.push(requestItem);
    groupedRequests.set(category, existingGroup);
  });

  return Array.from(groupedRequests.entries()).map(([category, data]) => ({
    category,
    data,
  }));
}

function getRemoteRequestToken() {
  return authStore.getState().session?.accessToken;
}

function isRemoteRequestListEnabled() {
  return Boolean(getRemoteRequestToken());
}

function getCachedRemoteRequestById(id: string) {
  for (const group of remoteGroupsCache) {
    const match = group.data.find((item) => item.id === id);
    if (match) {
      return createRequestDetails({
        ...match,
        kategori: match.kategori ?? group.category,
      });
    }
  }

  return null;
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

const apiClient = createApiClient(appConfig.api.baseUrl || REMOTE_REQUESTS_BASE_URL);

const remoteRequestService: RequestService = {
  async getRequests() {
    const accessToken = getRemoteRequestToken();

    if (!accessToken) {
      return mockRequestService.getRequests();
    }

    const response = await apiClient.request<RemoteRequestListResponseDto>(GET_REQUESTS_SINGLE_PATH, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const groups = mapRemoteResponseToGroups(response.data ?? []);
    remoteGroupsCache = cloneGroups(groups);

    return groups;
  },

  async getRequestHistory(_query?: RequestQuery) {
    return mockRequestService.getRequestHistory(_query);
  },

  async getRequestById(id: string) {
    return getCachedRemoteRequestById(id) ?? mockRequestService.getRequestById(id);
  },

  async processAction(ids: string[], action: 'APPROVE' | 'REJECT') {
    await mockRequestService.processAction(ids, action);
  },
};

export const requestService: RequestService = {
  getRequests() {
    return isRemoteRequestListEnabled()
      ? remoteRequestService.getRequests()
      : mockRequestService.getRequests();
  },

  getRequestHistory(query?: RequestQuery) {
    return mockRequestService.getRequestHistory(query);
  },

  getRequestById(id: string) {
    return isRemoteRequestListEnabled()
      ? remoteRequestService.getRequestById(id)
      : mockRequestService.getRequestById(id);
  },

  processAction(ids: string[], action: 'APPROVE' | 'REJECT') {
    return mockRequestService.processAction(ids, action);
  },
};

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
