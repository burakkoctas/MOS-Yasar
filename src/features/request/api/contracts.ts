export interface RemoteRequestOperationDto {
  operationName: string;
  statusCode: number;
  requiresDescription: number;
  color: string;
  descriptionRequirement: number;
  backgroundColor: string;
  textColor: string;
  requestOperationId?: number;
  displayOrder?: number;
}

export interface RemoteRequestItemDto {
  requestId: string;
  status: number;
  subject: string;
  descriptionList: string[];
  approver: string;
  referenceDocument: string;
  subSubject: string | null;
  requestDate: string;
  requesterFullName: string;
  multipleApprove: boolean;
  description: string;
  operations: RemoteRequestOperationDto[];
  descriptionRequirement: number;
  approvalRequiresDescription: boolean;
}

export interface RemoteRequestListResponseDto {
  code: number;
  message: string | null;
  data: RemoteRequestItemDto[];
  dataList: unknown;
  title: string | null;
}

export interface RequestListQueryDto {
  startDate?: string;
  endDate?: string;
  search?: string;
}

export interface RequestActionDto {
  ids: string[];
  action: 'APPROVE' | 'REJECT';
}

export interface RequestActionResponseDto {
  processedIds: string[];
  action: 'APPROVE' | 'REJECT';
}
