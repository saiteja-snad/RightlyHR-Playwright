export interface IPolicyAcknowledgementReports {
    fusionEmpId?: string;
    employeeId?: number;
    employeeName?: string;
    department? : string;
    subdepartment? : string;
    teamManagerName?: string;
    workEmail?: string;
    orgPolicyItemId?: number;
    acknowledged?: boolean;
    acknowledgedDate?: Date | string;
    source?: string;
    policyName?: string;
    location?: string;
    subLocation?: string;
    shift?: string;
    status?: string;
  }
  
  export interface IPolicyData {
    year: any;
    location: any;
    subLocation: any;
    shift: any;
  }
  
  