export interface IResource {
  resourceId: any;
  entityType: any;
  entityRefId: any;

  project: {
    projectId: any;
    projectName: any;
    projectType: any;
    description: any;

    meta?: {
      graphData?: {
        color?: string;
        code?: string;
      };
    };
  };
  employee: {
    id: any;
    fusionEmployeeId: any;
    name: any;
    workMail: any;
    designation: any;
    workPhoneCountryCode: any;
    workPhoneNumber: any;
    mobilePhoneNumber: any;
    mobilePhoneCountryCode: any;
  };
  projectRoleName: any;
  startDate: any;
  endDate: any;
  allocatedHours: any;
  allocatedFrequencyType: any;
  status: any;
  overtimeEligibile: any;
  billable: any;
  weekendWorkAllowed: any;
  allocatedBy: {
    id: any;
    fusionEmployeeId: any;
    name: any;
    workMail: any;
  };
  createdAt: any;
  updatedAt: any;
  role: any;
  phase: {
    phaseId: number;
    phaseName: string;
  };
  pendingApprovalAuthority: {
    id: number;
    fusionEmployeeId: string;
    name: string;
    workMail: string;
  };
  reason: string;
  statusEffectiveDate?: string;
}
