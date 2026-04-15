export interface DelegateDto {
  id: string;
  email: string;
  startDate: string;
  endDate: string;
  titles: string;
}

export interface CreateDelegateRequestDto {
  email: string;
  startDate: string;
  endDate: string;
  scope: 'ALL' | 'SELECT';
  titles: string[];
}

export interface DelegateListResponseDto {
  items: DelegateDto[];
}

export interface CreateDelegateResponseDto {
  item: DelegateDto;
}
