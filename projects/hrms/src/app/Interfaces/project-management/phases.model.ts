export interface IPhases {
  phaseId: number;
  project: {
    clientId: number;
    projectId:number;
    clientName: string;
    projectName: string;
    startDate: string;
    endDate: string;
    status: string;
  };
  phaseName: string;
  description: string;
  allocatedHours: number;
  status: string;
  startDate: string;
  endDate: string;
  effectiveDate: string;
  kickoffDate: string;
  pendingApprovalAuthority: {
    id: number;
    name: string;
    fusionEmpId: string;
    workMail: string;
  };
  meta?: {
    graphData?: {
      color?: string;
    };
  };
}
