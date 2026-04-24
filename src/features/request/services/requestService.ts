import { API_BASE_URL, APP_VERSION_BY_PLATFORM } from '@/src/config/appConfig';
import {
  ApproveRequestDto,
  ApproveResponseDto,
  RemoteAttachmentContentResponseDto,
  RemoteRequestAttachmentDto,
  RemoteRequestDetailDataDto,
  RemoteRequestDetailResponseDto,
  RemoteRequestHistoryItemDto,
  RemoteRequestHistoryQueryDto,
  RemoteRequestHistoryResponseDto,
  RemoteRequestItemDto,
  RemoteRequestListResponseDto,
} from '@/src/features/request/api/contracts';
import {
  CategoryGroup,
  RequestAttachment,
  RequestAttachmentContent,
  RequestDateRange,
  RequestDetailContentSection,
  RequestItem,
  RequestOperation,
  RequestQuery,
} from '@/src/features/request/types';
import { FetchApiClient } from '@/src/shared/api/apiClient';
import { DUMMY_DATA } from '@/src/shared/api/mockData';
import { authStore } from '@/src/store/useAuthStore';
import { Platform } from 'react-native';

const GET_REQUESTS_SINGLE_PATH = '/mos/api/v3/GetRequestsSingle';
const GET_REQUESTS_BY_DATE_RANGE_PATH = '/mos/api/v3/GetRequestsByDateRange';
const GET_DESCRIPTION_PATH = '/mos/api/v3/GetDescription';
const GET_ATTACHMENT_CONTENT_PATH = '/mos/api/v3/GetAttachmentContent';

let remoteGroupsCache: CategoryGroup[] = [];
let remoteHistoryGroupsCache: CategoryGroup[] = [];


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

function getDescriptionLines(description?: string) {
  if (!description) {
    return [];
  }

  return description
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
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

function formatRequestDateTime(value?: string) {
  if (!value) {
    return '-';
  }

  const [datePart, timePart] = value.split(',');
  const formattedDate = parseRequestDate(datePart);
  return timePart ? `${formattedDate} ${timePart}` : formattedDate;
}

function formatDateForHistoryApi(date: Date, endOfDay = false) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = endOfDay ? '23' : '00';
  const minutes = endOfDay ? '59' : '00';
  const seconds = endOfDay ? '59' : '00';

  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
}

function mapResolvedStatusCodeToLabel(status?: number) {
  switch (status) {
    case 0:
      return 'ONAY BEKLIYOR';
    case 1:
      return 'ONAYLANDI';
    case 2:
      return 'REDDEDILDI';
    case 3:
      return 'ONAY';
    case 4:
      return 'DUZELTME TALEP ET';
    case 5:
      return 'REDDET';
    default:
      return status === undefined ? '-' : `DURUM ${status}`;
  }
}

function mapResolvedStatusCodeToColors(status?: number) {
  switch (status) {
    case 0:
    case 4:
      return {
        backgroundColor: '#FFF2BE',
        textColor: '#FFB800',
      };
    case 1:
    case 3:
      return {
        backgroundColor: '#D6F2D1',
        textColor: '#51D23C',
      };
    case 2:
    case 5:
      return {
        backgroundColor: '#FDEBEB',
        textColor: '#FF4848',
      };
    default:
      return {
        backgroundColor: undefined,
        textColor: undefined,
      };
  }
}

function deriveApprovalStatus(item: { multipleApprove: boolean; approvalRequiresDescription: boolean }) {
  if (item.multipleApprove) {
    return 'Toplu Onaylanabilir';
  }

  if (item.approvalRequiresDescription) {
    return 'Açıklama Gerekli';
  }

  return 'Beklemede';
}

function mapOperationsToDomain(item: { operations: RemoteRequestItemDto['operations'] }): RequestOperation[] {
  const seen = new Set<string>();

  return item.operations
    .filter((operation) => {
      const key = `${operation.statusCode}-${operation.operationName}`;

      if (seen.has(key)) {
        return false;
      }

      seen.add(key);
      return true;
    })
    .sort((left, right) => {
      const leftOrder = left.displayOrder ?? Number.MAX_SAFE_INTEGER;
      const rightOrder = right.displayOrder ?? Number.MAX_SAFE_INTEGER;

      if (leftOrder !== rightOrder) {
        return leftOrder - rightOrder;
      }

      return left.statusCode - right.statusCode;
    })
    .map((operation) => ({
      operationName: operation.operationName,
      statusCode: operation.statusCode,
      requiresDescription: operation.requiresDescription,
      backgroundColor: operation.backgroundColor,
      textColor: operation.textColor,
      displayOrder: operation.displayOrder,
    }));
}

function mapAttachmentsToDomain(attachments: RemoteRequestAttachmentDto[]): RequestAttachment[] {
  return attachments
    .map((attachment, index) => {
      const url =
        attachment.url ??
        attachment.fileUrl ??
        attachment.downloadUrl ??
        attachment.path ??
        undefined;
      const name =
        attachment.fileName ??
        attachment.filename ??
        attachment.name ??
        attachment.attachmentName ??
        `Ek ${index + 1}`;
      const id = attachment.attachmentId ?? attachment.id ?? `${name}-${index}`;
      const requestId = attachment.requestid;

      if (!id && !name) {
        return null;
      }

      return { id, name, url, requestId };
    })
    .filter((attachment): attachment is RequestAttachment => Boolean(attachment));
}

function encodeAsciiToBase64(value: string) {
  const base64Chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  let output = '';

  for (let index = 0; index < value.length; index += 3) {
    const byte1 = value.charCodeAt(index);
    const hasByte2 = index + 1 < value.length;
    const hasByte3 = index + 2 < value.length;
    const byte2 = hasByte2 ? value.charCodeAt(index + 1) : 0;
    const byte3 = hasByte3 ? value.charCodeAt(index + 2) : 0;

    const chunk = (byte1 << 16) | (byte2 << 8) | byte3;

    output += base64Chars[(chunk >> 18) & 63];
    output += base64Chars[(chunk >> 12) & 63];
    output += hasByte2 ? base64Chars[(chunk >> 6) & 63] : '=';
    output += hasByte3 ? base64Chars[chunk & 63] : '=';
  }

  return output;
}

function buildDeviceInfo() {
  if (Platform.OS === 'android') {
    const constants = Platform.constants as { Brand?: string; Model?: string };
    const brand = constants.Brand ?? 'Android';
    const model = constants.Model ?? '';
    return `${brand} ${model}, Android ${Platform.Version}`.trim();
  }
  return `iPhone, iOS ${Platform.Version}`;
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
      `${item.gonderen} tarafından oluşturulan ${item.kategori ?? item.sirket} talebi için onay bekleniyor.`,
  };
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
  const moduleName = parseDescriptionValue(item.descriptionList, ['Modul']) ?? item.subject;
  const categoryName = parseDescriptionValue(item.descriptionList, ['Kategori']) ?? item.subject;
  const statusColors = mapResolvedStatusCodeToColors(item.status);

  return {
    id: item.requestId,
    istekNo: item.referenceDocument,
    gonderen: item.requesterFullName,
    sirket: company,
    statu: mapResolvedStatusCodeToLabel(item.status),
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
    operations: mapOperationsToDomain(item),
    statusCode: item.status,
    statusLabel: mapResolvedStatusCodeToLabel(item.status),
    descriptionList: item.descriptionList,
    statusBackgroundColor: statusColors.backgroundColor,
    statusTextColor: statusColors.textColor,
    subCategory: item.subSubject ?? undefined,
    multipleApprove: item.multipleApprove,
  };
}

function resolveStatusColorsFromOperations(
  operations: { statusCode: number; backgroundColor: string; textColor: string }[],
  status: number | undefined,
) {
  const matched = operations?.find((op) => op.statusCode === status);
  if (matched?.backgroundColor && matched?.textColor) {
    return { backgroundColor: matched.backgroundColor, textColor: matched.textColor };
  }
  return mapResolvedStatusCodeToColors(status);
}

function mapRemoteHistoryRequestToDomain(item: RemoteRequestHistoryItemDto): RequestItem {
  const descriptionLines = getDescriptionLines(item.description);
  const company =
    parseDescriptionValue(descriptionLines, ['Sirket', 'Satis Org']) ??
    item.subSubject ??
    item.subject;
  const startDate =
    parseDescriptionValue(descriptionLines, [
      'Aktivite Baslangic Tarihi',
      'Baslangic Tarihi',
      'Acilis Tarihi',
    ]) ?? parseRequestDate(item.requestDate);
  const endDate =
    parseDescriptionValue(descriptionLines, ['Aktivite Bitis Tarihi', 'Bitis Tarihi']) ?? '-';
  const moduleName = parseDescriptionValue(descriptionLines, ['Modul']) ?? item.subject;
  const categoryName = parseDescriptionValue(descriptionLines, ['Kategori']) ?? item.subject;
  const statusColors = resolveStatusColorsFromOperations(item.operations, item.status);

  return {
    id: item.requestId,
    istekNo: item.referenceDocument,
    gonderen: item.requesterFullName,
    sirket: company,
    statu: mapResolvedStatusCodeToLabel(item.status),
    baslangic: startDate,
    bitis: endDate,
    onayDurumu: item.status === 1 ? 'Onaylandı' : item.status === 2 ? 'Reddedildi' : 'Tamamlandı',
    isim: item.requesterFullName,
    tarih: parseRequestDate(item.requestDate),
    belgeNo: item.referenceDocument,
    acilis: startDate,
    modul: moduleName,
    kategori: categoryName,
    aciklama: item.description,
    operations: mapOperationsToDomain({ operations: item.operations }),
    statusCode: item.status,
    statusLabel: mapResolvedStatusCodeToLabel(item.status),
    descriptionList: descriptionLines,
    statusBackgroundColor: statusColors.backgroundColor,
    statusTextColor: statusColors.textColor,
    subCategory: item.subSubject ?? undefined,
    multipleApprove: item.multipleApprove ?? false,
    approver: item.approver,
  };
}

function buildDetailSections(detail: RemoteRequestDetailDataDto): RequestDetailContentSection[] {
  const sortedDescriptions = [...detail.descriptions].sort((a, b) => a.line_number - b.line_number);
  const sections: RequestDetailContentSection[] = [];
  let currentSection: RequestDetailContentSection = {
    title: detail.subject || 'Detaylar',
    lines: [],
  };

  sortedDescriptions.forEach((description) => {
    const rawText = description.data?.trim();

    if (!rawText) {
      return;
    }

    if (description.type === 0) {
      if (currentSection.lines.length > 0) {
        sections.push(currentSection);
      }

      currentSection = {
        title: rawText,
        lines: [],
      };
      return;
    }

    const separatorIndex = rawText.indexOf(':');

    if (separatorIndex > 0) {
      currentSection.lines.push({
        kind: 'pair',
        label: rawText.slice(0, separatorIndex).trim(),
        value: rawText.slice(separatorIndex + 1).trim(),
      });
      return;
    }

    currentSection.lines.push({
      kind: 'text',
      value: rawText,
    });
  });

  if (currentSection.lines.length > 0) {
    sections.push(currentSection);
  }

  if (detail.operationDescription?.trim()) {
    sections.push({
      title: 'İşlem Açıklaması',
      lines: [{ kind: 'text', value: detail.operationDescription.trim() }],
    });
  }

  return sections;
}

function mapRemoteRequestDetailToDomain(detail: RemoteRequestDetailDataDto): RequestItem {
  const descriptionLines = detail.descriptions
    .filter((item) => item.type === 1)
    .sort((a, b) => a.line_number - b.line_number)
    .map((item) => item.data);
  const company =
    parseDescriptionValue(descriptionLines, ['Sirket', 'Satis Org']) ??
    detail.subSubject ??
    detail.subject;
  const startDate =
    parseDescriptionValue(descriptionLines, [
      'Aktivite Baslangic Tarihi',
      'Baslangic Tarihi',
      'Acilis Tarihi',
    ]) ?? parseRequestDate(detail.requestDate);
  const endDate =
    parseDescriptionValue(descriptionLines, ['Aktivite Bitis Tarihi', 'Bitis Tarihi']) ?? '-';
  const moduleName = parseDescriptionValue(descriptionLines, ['Modul']) ?? detail.subject;
  const categoryName = parseDescriptionValue(descriptionLines, ['Kategori']) ?? detail.subject;
  const pseudoListItem: RemoteRequestItemDto = {
    requestId: detail.requestId,
    status: detail.status,
    subject: detail.subject,
    descriptionList: descriptionLines,
    approver: detail.approver,
    referenceDocument: detail.referenceDocument,
    subSubject: detail.subSubject,
    requestDate: detail.requestDate,
    requesterFullName: detail.requesterFullName,
    multipleApprove: detail.multipleApprove,
    description: descriptionLines.join('\n'),
    operations: detail.operations,
    descriptionRequirement: detail.descriptionRequirement,
    approvalRequiresDescription: detail.approvalRequiresDescription,
  };
  const statusColors = resolveStatusColorsFromOperations(detail.operations, detail.status);

  return {
    id: detail.requestId,
    istekNo: detail.referenceDocument,
    gonderen: detail.requesterFullName,
    sirket: company,
    statu: mapResolvedStatusCodeToLabel(detail.status),
    baslangic: startDate,
    bitis: endDate,
    onayDurumu: deriveApprovalStatus(detail),
    isim: detail.requesterFullName,
    tarih: formatRequestDateTime(detail.requestDate),
    belgeNo: detail.referenceDocument,
    acilis: startDate,
    modul: moduleName,
    kategori: categoryName,
    aciklama: descriptionLines.join('\n'),
    approver: detail.approver,
    requesterUsername: detail.requesterUsername,
    responseDate: formatRequestDateTime(detail.responseDate),
    operationDescription: detail.operationDescription,
    detailSections: buildDetailSections(detail),
    operations: mapOperationsToDomain(pseudoListItem),
    attachments: mapAttachmentsToDomain(detail.attachments ?? []),
    statusCode: detail.status,
    statusLabel: mapResolvedStatusCodeToLabel(detail.status),
    descriptionList: descriptionLines,
    statusBackgroundColor: statusColors.backgroundColor,
    statusTextColor: statusColors.textColor,
    subCategory: detail.subSubject ?? undefined,
    multipleApprove: detail.multipleApprove,
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
  const session = authStore.getState().session;
  return session?.mode === 'remote' && Boolean(session.accessToken);
}


function getCachedRemoteRequestById(id: string, source?: 'request' | 'history') {
  const cacheSource = source === 'history' ? remoteHistoryGroupsCache : remoteGroupsCache;

  for (const group of cacheSource) {
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
  getRequestById(id: string, source?: 'request' | 'history'): Promise<RequestItem | null>;
  getAttachmentContent(attachmentId: string): Promise<RequestAttachmentContent | null>;
  processAction(ids: string[], operation: RequestOperation): Promise<void>;
}

const mockRequestService: RequestService = {
  async getRequests(): Promise<CategoryGroup[]> {
    return cloneGroups(mockGroups);
  },

  async getRequestHistory(query?: RequestQuery): Promise<CategoryGroup[]> {
    const sourceGroups = mockGroups;

    return cloneGroups(sourceGroups)
      .map((group) => ({
        ...group,
        data: group.data.filter((item) => isInRange(parseTurkishDate(item.baslangic), query?.range)),
      }))
      .filter((group) => group.data.length > 0);
  },

  async getRequestById(id: string): Promise<RequestItem | null> {
    const sourceGroups = mockGroups;

    for (const group of sourceGroups) {
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

  async getAttachmentContent(_: string): Promise<RequestAttachmentContent | null> {
    return null;
  },

  async processAction(ids: string[], operation: RequestOperation): Promise<void> {
    const targetGroups = mockGroups;

    targetGroups.forEach((group) => {
      group.data = group.data.map((item) =>
        ids.includes(item.id)
          ? {
              ...item,
              onayDurumu: operation.operationName,
            }
          : item,
      );
    });
  },
};

const apiClient = new FetchApiClient(API_BASE_URL);

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

  async getRequestHistory(query?: RequestQuery) {
    const accessToken = getRemoteRequestToken();

    if (!accessToken || !query?.range) {
      return mockRequestService.getRequestHistory(query);
    }

    const historyQuery: RemoteRequestHistoryQueryDto = {
      startDate: formatDateForHistoryApi(query.range.start),
      endDate: formatDateForHistoryApi(query.range.end, true),
      searchValue: query.searchValue ?? '',
    };

    const response = await apiClient.request<RemoteRequestHistoryResponseDto>(
      GET_REQUESTS_BY_DATE_RANGE_PATH,
      {
        method: 'POST',
        body: historyQuery,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );

    const groupedRequests = new Map<string, RequestItem[]>();

    (response.data ?? []).forEach((item) => {
      const category = item.subject?.trim() || 'Diger';
      const requestItem = mapRemoteHistoryRequestToDomain(item);
      const existingGroup = groupedRequests.get(category) ?? [];
      existingGroup.push(requestItem);
      groupedRequests.set(category, existingGroup);
    });

    const groups = Array.from(groupedRequests.entries()).map(([category, data]) => ({
      category,
      data,
    }));

    remoteHistoryGroupsCache = cloneGroups(groups);

    return groups;
  },

  async getRequestById(id: string, source?: 'request' | 'history') {
    const accessToken = getRemoteRequestToken();

    if (!accessToken) {
      return mockRequestService.getRequestById(id);
    }

    const response = await apiClient.request<RemoteRequestDetailResponseDto>(
      `${GET_DESCRIPTION_PATH}/${id}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );

    if (!response.data) {
      return (
        getCachedRemoteRequestById(id, source) ??
        mockRequestService.getRequestById(id)
      );
    }

    return createRequestDetails(mapRemoteRequestDetailToDomain(response.data));
  },

  async getAttachmentContent(attachmentId: string) {
    const accessToken = getRemoteRequestToken();

    if (!accessToken) {
      return null;
    }

    const encodedAttachmentId = encodeAsciiToBase64(attachmentId);
    const response = await apiClient.request<RemoteAttachmentContentResponseDto>(
      `${GET_ATTACHMENT_CONTENT_PATH}?attachmentId=${encodeURIComponent(encodedAttachmentId)}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );

    if (!response.data?.content) {
      return null;
    }

    return {
      id: response.data.attachmentId || attachmentId,
      name: response.data.name || 'ek',
      content: response.data.content,
    };
  },

  async processAction(ids: string[], operation: RequestOperation) {
    const accessToken = getRemoteRequestToken();

    if (!accessToken) {
      return mockRequestService.processAction(ids, operation);
    }

    const appVersion = APP_VERSION_BY_PLATFORM[Platform.OS === 'ios' ? 'ios' : 'android'];
    const deviceInfo = buildDeviceInfo();

    await Promise.all(
      ids.map(async (requestId) => {
        const body: ApproveRequestDto = {
          appVersion,
          deviceInfo,
          operationDescription: null,
          requestId,
          status: operation.statusCode,
        };

        const response = await apiClient.request<ApproveResponseDto>(
          '/mos/api/v3/Approve3',
          {
            method: 'POST',
            body,
            headers: { Authorization: `Bearer ${accessToken}` },
          },
        );

        if (response.code !== 200) {
          throw new Error(response.title || response.message || 'İşlem gerçekleştirilemedi.');
        }
      }),
    );
  },
};

export const requestService: RequestService = {
  getRequests() {
    return isRemoteRequestListEnabled()
      ? remoteRequestService.getRequests()
      : mockRequestService.getRequests();
  },

  getRequestHistory(query?: RequestQuery) {
    return isRemoteRequestListEnabled()
      ? remoteRequestService.getRequestHistory(query)
      : mockRequestService.getRequestHistory(query);
  },

  getRequestById(id: string, source?: 'request' | 'history') {
    return isRemoteRequestListEnabled()
      ? remoteRequestService.getRequestById(id, source)
      : mockRequestService.getRequestById(id);
  },

  getAttachmentContent(attachmentId: string) {
    return isRemoteRequestListEnabled()
      ? remoteRequestService.getAttachmentContent(attachmentId)
      : mockRequestService.getAttachmentContent(attachmentId);
  },

  processAction(ids: string[], operation: RequestOperation) {
    return isRemoteRequestListEnabled()
      ? remoteRequestService.processAction(ids, operation)
      : mockRequestService.processAction(ids, operation);
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

  return { start, end };
}
