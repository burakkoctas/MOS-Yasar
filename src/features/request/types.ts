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
}
