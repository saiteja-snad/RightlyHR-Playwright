import { Dayjs } from 'dayjs';

export interface IStandardReports {}

export interface IStandardReportRequest {
  employeeStatus?: string;
  dateRange?: { startDate: Dayjs | null ; endDate: Dayjs | null };
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
  teamManagerEmpID?:string;
  employeeId?:string;
  teamManagerID?:any;
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
  employeeId?:string;
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
  employeeId?:string;
  teamManagerID?:any;
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
  employeeId?:string;
  teamManagerID?: any;
}

export interface IPermissionReportRequest {
  FusionEmpId?: string;
  EmployeeName?: string;
  TeamManagerName?: string;
  StartDate?: string;
  EndDate?: string;
  teamManagerId?:number;
  employeeId?:string;
  teamManagerEmpId?: any;
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
  teammanager: string;
  reportFirstName: string;
  reportLastName: string;
  workPhone: number;
  contactnumber: number;
  mobilePhoneCountryCode: any;
  workPhoneCountryCode: any;
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
  jobsublocationid: number;
  joblocationid: number;
  joblocationname: string;
  jobsublocationname: string;
  shiftname: string;
  shiftid: number;
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
  employeeId?:any;
  teamManagerEmpID?:any;
  TeamManagerFusionEmpId?:any;
  teamManagerID?:any;
  teamManagerEmpId?: any;
  year?: number;
  shiftIds?: string;
  locationIds?: string;
  subLocationIds?: string;
  leaveCategoryIds?: string; 

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
  TeamManagerFusionEmpId?:string;
  employeeId?:string;
  EmployeeId?:any;
  teamManagerID? : any;
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
  teamManagerEmpID?:string;
  employeeId?:string;
  teamManagerID? : any;
}

export interface IExpenseReportsRequestDetails{
  employeeId?: number;
  fusionEmpId?: string;
  employeeName?:string;
  department?:string;
  teamManagerId?:number;
  teamId?:number;
  teamManagerFusionId?:string;
  teamManagerName?:string;
  location?:string;
  subLocation?:string;
  shift?:string;
  appliedDate?:string;
  expenseTitle?:string;
  expenseItemName?:string;
  expenseItemDescription?:string;
  expenseItemStatus?:string;
  expenseDate?:string;
  receiptNumber?:string;
  startDate?:string;
  endDate?:string;
}

export interface IExpenseReportsDetails {
  expenseId?: number;
  fusionEmpId?: string;
  employeeId?: number;
  employeeName?: string;
  department?: string;
  teamManagerID?: number;
  teamManagerFusionEmpId?: string;
  teamManagerName?: string;
  shift?: string;
  location?: string;
  subLocation?: string;
  appliedDate?: string;
  expenseTitle?:string;
  expensesStatus?: string;
  totalAmount?: number;
  expensesItems?: IExpenseItemDetails[];
  startDate?: string;
  endDate?: string;
  totalExpenseAmount: number;
  totalExpenseCount: number;
  totalItemsCount: number;

}

export interface IExpenseItemDetails {
  expenseItemId?: number;
  expenseHeaderId?: number;
  expenseItemName?: string;
  expenseType?: string;
  expenseItemsDescription?: string;
  expenseDate?: string;
  expenseAmount?: number;
  receiptNumber?: string;
  status?: string;
  attachmentURL?: string;
  expanded?: boolean;
}