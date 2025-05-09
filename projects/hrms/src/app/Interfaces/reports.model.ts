import { Dayjs } from 'dayjs';



export interface IStandardReports {}

export interface IStandardReportRequest {
  employeeStatus?: string;
  dateRange?: { startDate: Dayjs; endDate: Dayjs };
  selectedBranchLocation?: string;
  selectedJobLocation?: string;
  selectedJobSubLocation?: string;
}

export interface IWfhReportRequest {
  FusionEmpId?: string;
  EmployeeName?: string;
  Department?: string;
  TeamManagerName?: string;
  Shift?: string;
  Location?: string;
  SubLocation?: string;
  Worked_Date?: string;
  StartDate?: string;
  EndDate?: string;
  Worked_Month?: number;
  TeamManagerSnadId?: string;
}

export interface IAbsentReportRequest {
  FusionEmpId?: string;
  EmployeeName?: string;
  Department?: string;
  TeamManagerName?: string;
  Shift?: string;
  Location?: string;
  SubLocation?: string;
  Worked_Date?: string;
  StartDate?: string;
  EndDate?: string;
  Worked_Month?: number;
  Team_Manager?:string
  TeamManagerSnadId?: string;
}

export interface IInactiveReportRequest {
  FusionEmpId?: string;
  EmployeeName?: string;
  Department?: string;
  TeamManagerName?: string;
  shift?: string;
  location?: string;
  LeaveName?: number;
  Year?: number;
  TeamManagerSnadId?: string;
}

export interface IYearlyReportRequest {
  FusionEmpId?: string;
  EmployeeName?: string;
  Department?: string;
  TeamManagerName?: string;
  LeaveName?: string;
  Location?: string;
  Shift?: string;
  EntitlementYear?: number;
  TeamManagerSnadId?: string;
}


export interface IPermissionReportRequest {
  FusionEmpId?: string;
  EmployeeName?: string;
  TeamManagerName?: string;
  StartDate?: string;
  EndDate?: string;
  teamManagerId?:number;
}

export interface IFamilyDetails{
  empStatus: string;
  employeeId: number,
  firstName: string,
  middleName: string,
  lastName: string,
  workEmail: string,
  insurance: any,
  familyMembers:IFamilyMember[],
  memberName:string,
  relation:string,
  memberDateOfBirth:any,
  dependent:any;
  fusionEmpId: string;
}


export interface IFamilyMember {
  memberName: string;
  relation: string;
  memberDateOfBirth: string; // ISO string format (e.g., "2005-02-02T00:00:00")
  dependent: string; // Consider using boolean if applicable
}


export interface EmployeeDetails {
  employeeId: number;
  fusionEmpId: string;
  empstatus: string;
  firstName: string;
  middleName: string;
  lastName: string;
  gender: string;
  dob: string;
  maritalStatus: string;
  permanentaddressline1: string;
  permanentaddressline2: string;
  permanentcity: string;
  permanentstate: string;
  permanentcountry: string;
  permanentzipcode: string;
  currentaddressline1: string;
  currentaddressline2: string;
  currentcity: string;
  currentstate: string;
  currentcountry: string;
  currentzipcode: string;
  teamManager: string;
  reportFirstName: string;
  reportLastName: string;
  workPhone: number;
  contactnumber: number;
  workEmail: string;
  emailaddress: string;
  emergencyName: string;
  emergencynumber: number;
  relationShip: string;
  emergencyName1: string;
  emergencyNumber1: number;
  relationship1: string;
  dateOfJoining: string;
  probationEndDate: string;
  noticePeriod: string;
  salaryHold: string;
  pfApplicable: string;
  esicApplicable: string;
  pt: string;
  healthInsurance: string;
  aadhaar: string;
  pan: string;
  offerSentDate: string;
  offerSentBy: string;
  offerSentStatus: string;
  appointmentSentDate: string;
  appointmentSenyBy: string;
  appointmentSentStatus: string;
  jobEffectiveDate: string;
  jobRole: string;
  departmentName: string;
  subdepartment_name: string;
  reportingManager: string;
  jobSubLocationId: number;
  jobLocationId: number;
  joblocationname: string;
  jobsublocationname: string;
  shiftname: string;
  shiftId: number;
  shiftcode: string;
  compeffectivedate: string;
  overtimeeligibility: string;
  reason: string;
  frequency: string;
  paytype: string;
  compensationamount: number;
  title: string;
  branchcode: string;
  jobType: string;
  gradeName: string;
}


export interface Branch {
  sno: number;
  branchCode: string;
  isDeleted: boolean;
  branchLocation1: string;
}
//attendance report

export interface IAttendanceDetails{
  // selectedLeaveEmployeeId?: any;
  // selectedDateRange?: { startDate: Dayjs; endDate: Dayjs };
  // selectedMonth?: any;
  LeaveName?: any;
  // selectedLeaveManager?: any;
  FusionEmpId?: string;
  EmployeeName?: string;
  Department?: string;
  TeamManagerName?: string;
  Shift?: string;
  Location?: string;
  SubLocation?: string;
  Worked_Date?: string;
  StartDate?: string;
  EndDate?: string;
  Worked_Month?: number;
  teamManagerId?:number;
  TeamManagerSnadId?: string;
}
//leave summmery
export interface ILeavesummery{
  // selectedEmployeeId?: any;
  // selectedLeave?: any;
  // selectedLeaveSummaryManager?: any;
  FusionEmpId?: string;
  EmployeeName?: string;
  Department?: string;
  TeamManagerName?: string;
  LeaveName?: string;
  Location?: string;
  Shift?: string;
  Year?: number;
  TeamManagerSnadId?: string;
}
//comp-off
export interface ICompoffDetails{
  // selectedEmployeeId?: any;
  // selectedDateRange?: { startDate: Dayjs; endDate: Dayjs };
  // selectedMonth?: any;
  // selectedCompoffManager?: any;
  // selectedLeave?: any;
  // selectedLeaveManager?: any;
  FusionEmpId?: string;
  EmployeeName?: string;
  Department?: string;
  TeamManagerName?: string;
  Shift?: string;
  Location?: string;
  SubLocation?: string;
  Worked_Date?: string;
  StartDate?: string;
  EndDate?: string;
  Worked_Month?: number;
  TeamManagerSnadId?: string;
}
