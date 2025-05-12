// Team Leave Balance
export interface IEmployeeLeaveData {
  employeeBasicDetails: IEmployeeBasicDetails;
  categories: ILeaveCategory[];
}

export interface IEmployeeBasicDetails {
  employeeId: number;
  employeeName: string;
  workEmail: string;
  snadEmployeeId: string;
}

export interface ILeaveCategory {
  category: ILeaveCategoryDetails;
  allowedDays: number;
  utilizedDays: number;
  booked: number;
}

export interface ILeaveCategoryDetails {
  id: number;
  applicableYear: number;
  locationID: number;
  shiftId: number;
  subLocation: number;
  type: number;
  name: string;
  categoryColor: string;
  categoryCode: string;
  allowedHalfDay: boolean;
  allowedGender: number;
  allowedMaritalStatus: number;
  excludeWeekends: boolean;
  excludeHolidays: boolean;
  futureDatesAllowed: boolean;
  futureDatesAllowedDays: number;
  pastDateAllowed: boolean;
  pastDatesAllowedDays: number;
  carryForwardAllowed: boolean;
  carryForwardAllowedType: boolean;
  carryForwardAllowedValue: number;
  encashAllowedType: boolean;
  encashAllowedValue: number;
  validity: number;
  status: string;
  addedBy: number;
  addedDate: string;  
  lastModifiedBy: number;
  lastModifiedDate: string;  
  noticeperiodAllowedType: boolean;
  noticePeriodAllowedValue: number;
  isDefault: boolean;
  isProbationAllowed: boolean;
  probationDays: number;
  isOptionalHoliday: boolean;
  isApplicableProRataLeave: boolean;
  leaveTypeId: number;
}

export interface LeaveRequest {
  employeeId: number;
  duration: number;
  enddate: string; // ISO date string (e.g., "2025-05-09T00:00:00")
  startdate: string; // ISO date string
  notes: string;
  status: string;
  id: number;
  date: string; // Request date
  isdeleted: boolean;
  isDaytype: boolean;
  requestType: string;
  durationType: string; // Could be '1', '2', etc. (you may convert to enum if needed)
  categoryId: number;
  requestedBy: number;
  empFirstName: string;
  empLastName: string;
  empMiddleName: string;
  reqByFirstName: string;
  reqByLastName: string;
  reqByMiddleName: string;
  categoryName: string;
}

// Team Leave Summary
export interface ITeamLeaveSummary {
  employeeId: number;
  employeeName: string;
  workEmail?: string;
  fusionEmpId: string;
  leaves: ILeaveRecord[];
  wfh: IWFHRecord[];
  permissions: IPermissionRecord[];
  regularization: IRegularizationRecord[];
}

export interface ILeaveRecord {
    employeeId: number;
    duration: number;
    startdate: string;      
    enddate: string;        
    notes: string;
    status: string;        
    id: number;
    durationType: string;  
    categoryId: number;
    categoryName: string;
}

export interface IWFHRecord {
  id: number;
  startTime: string; 
  endTime: string;   
  requestedComments: string;
  durationType: number;
  durationTypeValue: string;
  duration: number;
  status: string;
  reason: string;
  requestedCategory: number;
}

export interface IPermissionRecord {
  requestedDate: string;
  type: string;
  duration: string; 
  status: string;
  notes: string;
}

export interface IRegularizationRecord {
  requestedDate: string; 
  type: string;
  duration: string | number;
  status: string;
  notes: string;
}
