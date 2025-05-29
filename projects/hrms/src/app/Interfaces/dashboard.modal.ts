export interface IBirthDaysData {
    firstName:string,
    middleName:string,
    lastName:string,
    dob:string,
    fusionEmpId:string
}

export interface IAnniversariesData {
    firstName:string,
    middleName:string,
    lastName:string,
    fusionEmpId:string,
    dateOfJoining:string,
    anniversaryYearCount:number,
}


export interface IOrgHolidaysHeader{
    id: string,
    locationId: number,
    subLocationId: number,
    shiftID: number,
    applicableyear: number,
    status: string,
    addedby: number,
    addedDate: string,
    authorizedby: number,
    authorizedDate: string,
    authorizedstatus: string,
    lastModifedby: number,
    lastModifeddate: string,
    orgHolidaysItems:IOrgHolidaysItems[]
}

export interface IOrgHolidaysItems {
  id: number;
  headerID: number;
  holidayName: string;
  holidayDate: string;
  holidayColor: string;
  isOptional: boolean;
  status: string;
}

export interface INewJoinee {
  employeeId: number;
  firstName: string;
  lastName:string;
  middleName: string;
  dateOfJoining: string;
  jobRole:string;
  fusionEmpId: string;
}

export interface IMarriageAnniversary {
  firstName:string
  middleName: string;
  lastName:string;
  marriedDate: Date;
  fusionEmpId: string;
}


export interface AttendanceResponse {
  data: AttendanceData;
}

export interface AttendanceData {
  employeeId: number;
  month: number;
  year: number;
  attendanceData: AttendanceEntry[];
  summary: AttendanceSummary[];
  shiftDetails: ShiftDetails;
}

export interface AttendanceEntry {
  date: Date;
  firstLogin: string;
  duration: Duration;
  status: string;
  displayStatus: DisplayStatus;
  tags: Tag[];
  biometricLogs: BiometricLog[];
  regularizations: any[]; // If the structure is known, replace `any` with the proper interface
  permissions: Permission[];
  isRegularizationApplicable: boolean;
  isLeaveApplicable: boolean;
}

export interface Duration {
  permissionDuration: string;
  biometricDuration: string;
  regularizationDuration: string;
  totalDuration: string;
}

export interface DisplayStatus {
  status: string;
  colour: string;
  statusCode: string;
}

export interface Tag {
  name: string;
  order: number;
  colour: string;
}

export interface BiometricLog {
  in: string;
  out: string;
  duration: string;
}

export interface Permission {
  id: number;
  requestedDate: string;
  duration: string;
  status: string;
  type: string;
}

export interface AttendanceSummary {
  order: number;
  status: string;
  value: number;
}

export interface ShiftDetails {
  id: number;
  name: string;
  headerId: number;
  shiftStartTime: string;
  shiftEndTime: string;
  shiftDescription: string;
  code: string;
  allowedGracePeriod: number;
  latesAllowed: number;
  allowedBreakTime: number;
  halfDayMinHrs: number;
  fullDayMinHrs: number;
}


export interface StatusCount {
  status: string;
  count: number;
}

export interface EmployeeStatusCount {
  totalCount: number;
  statusWiseCount: StatusCount[];
}
