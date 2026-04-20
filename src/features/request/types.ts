export interface RequestOperation {
  operationName: string;
  statusCode: number;
  requiresDescription: number;
  backgroundColor: string;
  textColor: string;
  displayOrder?: number;
}

export interface RequestAttachment {
  id: string;
  name: string;
  url?: string;
  requestId?: string;
}

export interface RequestAttachmentContent {
  id: string;
  name: string;
  content: string;
}

export interface RequestItem {
  id: string;
  istekNo: string;
  gonderen: string;
  sirket: string;
  statu: string;
  baslangic: string;
  bitis: string;
  onayDurumu: string;
  isim?: string;
  tarih?: string;
  belgeNo?: string;
  acilis?: string;
  modul?: string;
  kategori?: string;
  aciklama?: string;
  approver?: string;
  requesterUsername?: string;
  responseDate?: string;
  operationDescription?: string;
  detailSections?: RequestDetailContentSection[];
  operations?: RequestOperation[];
  statusBackgroundColor?: string;
  statusTextColor?: string;
  attachments?: RequestAttachment[];
  statusCode?: number;
  statusLabel?: string;
  descriptionList?: string[];
  subCategory?: string;
  multipleApprove?: boolean;
}

export interface RequestDetailLine {
  kind: 'pair' | 'text';
  label?: string;
  value: string;
}

export interface RequestDetailContentSection {
  title: string;
  lines: RequestDetailLine[];
}

export interface CategoryGroup {
  category: string;
  data: RequestItem[];
}

export interface RequestDateRange {
  start: Date;
  end: Date;
}

export interface RequestQuery {
  range?: RequestDateRange | null;
  searchValue?: string;
}
