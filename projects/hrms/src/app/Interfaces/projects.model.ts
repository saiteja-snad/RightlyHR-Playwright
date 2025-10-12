export interface IProjectResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: Project[];
}

export interface Project {
  projectId: number;
  projectName: string;
  description: string;
  projectType: string;
  allocatedHours: number;
  isOvertimeEligibile: boolean;
  isBillable: boolean;
  isWeekendWorkAllowed: boolean;
  startDate: string;       // ISO date string
  endDate: string;         // ISO date string
  effectiveDate: string;   // ISO date string
  kickoffDate: string;     // ISO date string
  status: string;
  createdAt: string;       // ISO datetime
  updatedAt: string;       // ISO datetime
  client: Client;
  pendingApprovalAuthority: Authority;
  createdBy: Authority;
}

export interface Client {
  clientId: number;
  clientName: string;
  status: string;
}

export interface Authority {
  id: number;
  name: string;
}