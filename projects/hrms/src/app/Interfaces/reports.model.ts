import { Dayjs } from 'dayjs';



export interface IStandardReports {}

export interface IStandardReportRequest {
  employeeStatus?: string;
  dateRange?: { startDate: Dayjs; endDate: Dayjs };
  selectedBranchLocation?: string;
  selectedJobLocation?: string;
  selectedJobSubLocation?: string;
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
  dependent:any
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
  permanentAddressLine1: string;
  permanentAddressLine2: string;
  permanentCity: string;
  permanentState: string;
  permanentCountry: string;
  permanentZipCode: string;
  currentAddressLine1: string;
  currentAddressLine2: string;
  currentCity: string;
  currentState: string;
  currentCountry: string;
  currentZipCode: string;
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
  jobLocationName: string;
  jobSubLocationName: string;
  shiftName: string;
  shiftId: number;
  shiftCode: string;
  compeffectivedate: string;
  overtimeeligibility: string;
  reason: string;
  frequency: string;
  paytype: string;
  compensationamount: number;
  title: string;
  branchCode: string;
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
  selectedLeaveEmployeeId?: any;
  selectedDateRange?: { startDate: Dayjs; endDate: Dayjs };
  selectedMonth?: any;
  selectedLeave?: any;
  selectedLeaveManager?: any;
}
//leave summmery
export interface ILeavesummery{
  selectedEmployeeId?: any;
  selectedLeave?: any;
  selectedLeaveSummaryManager?: any;
}
//comp-off
export interface ICompoffDetails{
  selectedEmployeeId?: any;
  selectedDateRange?: { startDate: Dayjs; endDate: Dayjs };
  selectedMonth?: any;
  selectedCompoffManager?: any;
}
