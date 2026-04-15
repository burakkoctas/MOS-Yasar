export interface RequestItemDto {
  id: string;
  requestNo: string;
  senderName: string;
  companyName: string;
  workflowStatus: string;
  startDate: string;
  endDate: string;
  approvalStatus: string;
  displayName?: string;
  documentNo?: string;
  moduleName?: string;
  categoryName?: string;
  description?: string;
}

export interface RequestCategoryDto {
  categoryName: string;
  items: RequestItemDto[];
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
