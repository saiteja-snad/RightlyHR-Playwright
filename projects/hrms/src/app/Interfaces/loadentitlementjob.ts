export interface IJobsResponse {
  success: boolean;
  statusCode: number;
  message: string;
  pagination: IPagination;
  data: IJob[];
}

export interface IPagination {
  currentPage: number;
  pageSize: number;
  totalRecords: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  nextPage: number;
}

export interface IJob {
  jobId: number;
  jobType: string;
  year: number;
  location: ILocation;
  subLocation: ISubLocation;
  shift: IShift;
  status: string;
  totalEmployees: number;
  totalCategories: number;
  totalRecords: number;
  successCount: number;
  failedCount: number;
  retryCount: number;
  notes: string;
  versionStamp: string;
  requestPayload: IRequestPayload;
  initiatedBy: IInitiatedBy;
  initiatedAt: string;
  startedAt?: string; // optional, since not all contain startedAt
}

export interface ILocation {
  id: number;
  name: string;
}

export interface ISubLocation {
  id: number;
  name: string;
}

export interface IShift {
  id: number;
  name: string;
}

export interface IRequestPayload {
  Employees: any[][][][][]; // deeply nested array, keep flexible
}

export interface IInitiatedBy {
  id: number;
  name: string;
  fusionEmpId: string;
  workMail: string;
}
