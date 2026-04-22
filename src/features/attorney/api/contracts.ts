export interface MosApiWrapper<T> {
  code: number;
  message: string | null;
  data: T | null;
  dataList: T[] | null;
  title: string | null;
}

export interface AttorneySubjectDto {
  allowedSubjectId: number;
  subject: string;
}

export interface AttorneyDto {
  attorneyId: string;
  receiverEmail: string;
  giverEmail: string;
  deleted: boolean;
  startDate: string;
  endDate: string;
  allSubjects: boolean;
  subjects?: AttorneySubjectDto[];
  allowedSubjectIds?: number[];
  active: boolean;
}

export interface AttorneyListDataDto {
  currentAttorneys: AttorneyDto[];
  history: AttorneyDto[];
}

export interface CreateAttorneyRequestDto {
  receiverEmail: string;
  startDate: string;
  endDate: string;
  allSubjects: boolean;
  allowedSubjectIds: number[] | null;
}
