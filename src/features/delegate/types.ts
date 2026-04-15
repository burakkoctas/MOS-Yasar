export interface Delegate {
  id: string;
  email: string;
  startDate: string;
  endDate: string;
  titles: string;
}

export interface CreateDelegatePayload {
  email: string;
  startDate: Date;
  endDate: Date;
  scope: 'ALL' | 'SELECT';
  selectedTitles: string[];
}
