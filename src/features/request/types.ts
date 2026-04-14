// Path: src/features/request/types.ts

export interface RequestItem {
  id: string;
  istekNo: string;
  gonderen: string;
  sirket: string;
  statu: string;
  baslangic: string;
  bitis: string;
  onayDurumu: string;
  // Detay ekranındaki sahte veri (dummy detail) ile tam uyumlu olması için opsiyonel alanlar
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