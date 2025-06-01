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

  export interface JobSubLocation {
  id: number;
  jobLocationId: number;
  jobSubLocationName: string;
  isDeleted: boolean;
}

export interface JobLocation {
  id: number;
  jobLocationName: string;
  isDeleted: boolean;
  subLocations: JobSubLocation[];
}

export interface JobLocationDropdownOption {
  label: string;
  value: JobLocation;
}
  
  