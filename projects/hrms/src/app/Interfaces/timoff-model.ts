export interface Iorgcategoryleaves {
  id: any;
  applicableYear: any;
  locationID: any;
  subLocation: any;
  shiftId: any;
  type: any;
  name: string;
  categoryColor: string;
  categoryCode: string;
  allowedHalfDay: boolean;
  allowedGender: any;
  allowedMaritalStatus: any;
  excludeWeekends: boolean;
  excludeHolidays: boolean;
  futureDatesAllowed: boolean;
  futureDatesAllowedDays: any;
  pastDateAllowed: boolean;
  pastDatesAllowedDays: any;
  carryForwardAllowed: boolean;
  carryForwardAllowedType: boolean;
  carryForwardAllowedValue: any;
  encashAllowedType: boolean;
  encashAllowedValue: any;
  parentId: any;
  validity: any;
  status: string;
  addedBy: any;
  addedDate: any;
  lastModifiedBy: any;
  lastModifiedDate: any;
  shiftName: any;
  subLocationName: any;
  locationName: any;
  noticePeriodAllowedValue: any;
  noticeperiodAllowedType: any;
  isOptionalHoliday: boolean;
  isApplicableProRataLeave: any;
  probationDays: any;
  isProbationAllowed: any;
}
export interface ICategoryDetails {
  category: Iorgcategoryleaves;
  allowedDays: number;
  utilizedDays: number;
  booked: number;
  categoryColor: any;
  categoryCode: any;
  duration: number;
  probationLeaves: number;
  noticePeriodLeaves: number;
}
export interface Ileavesdatas {
  requestedBy: any;
  isNotVisible: boolean;
  employeeId: any;
  leaveType: any;
  duration: any;
  startdate: any;
  enddate: any;
  notes: any;
  status: any;
  id: any;
  Time: number;
  isDaytype: boolean;
  leavesapplied: number;
  remainingleaves: number;
  leavePolicyId: number;
  categoryId: any;
  durationType: any;
  date: any;
  categoryName: string;
  isdeleted: boolean;
  requestType?: string;
  refModule: string;
  refEntityId: number;
  leavesTaken: number;
  requestedComments: string;
  endTimeProp: any;
  startTimeProp: any;
}
export interface Ilpid {
  employeeId: any;
  leaveType: any;
  duration: any;
  startdate: any;
  enddate: any;
  notes: any;
  status: any;
  id: any;
  Time: number;
  leavePolicyId: number;
  categoryName: string;
  categoryId: number;
  date: any;
  isdeleted: string;
  rejectedReason: string;
  actualStatus: string;
  durationType: any;
}
export interface ILeaves {
  custompolicyleaves: any;
  remainingLeaves: number;
  totalLeaves: number;
  categoryName: string;
  categoryId: number;
  gradeId: number;
  maxDays: number;
  lpId: number;
  leavesTaken: number;
}
export interface ILeavesTaken {
  id: number;
  employeeId: number;
  leavePolicyId: number;
  leavesTaken: number;
  remainingLeaves: number;
  totalleaves: number;
}
export interface IValidations {
  isStartTimeShouldbelessthanEndTime: boolean;
  StartTimeShouldbelessthanEndTimeErrorMessage?: string;
  isdurationValidated: boolean;
  DurationErrorMessage?: string;
}
export interface RegularizationApproverComment {
  id: number;
  pendingItemsId: number;
  addedBy: string;
  addedDate: string;
  comments: string;
  addedByFusionEmpId: string;
  addedName: string;
  action: string;
}
export interface RegularizationRequest {
  id: number;
  raisedFor: number;
  requestedBy: number;
  requestedDate: string;
  createdDate: string;
  type: string;
  moduleId: number;
  referenceTypeId: number;
  duration: string;
  status: string;
  processedComment: string;
  notes: string;
  approverHeaderId: number;
  cancelledReason:string;
  regularizationApproverComments: RegularizationApproverComment[];
}
export interface LeaveType {
  id: number;
  name: string;
  isDeleted: boolean;
  type: string;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}
export interface IEAV {
  id: number;
  entity: string;
  attribute: string;
  value: string;
  meta: string;
}
export interface AttendanceRequest {
  entity: AttendanceEntity;
  approvalHeader: ApprovalHeader;
  module: Module;
  currentApprover: string;
}
export interface AttendanceEntity {
  attendanceRequestId: number;
  attendanceRequestEmployeeId: number;
  attendanceRequestFusionEmployeeId: string;
  attendanceRequestStartTime: string;
  attendanceRequestEndTime: string;
  attendanceRequesterName: string;
  attendanceRequestDuration?: number;
  attendanceRequestAppliedDate: string;
  attendanceRequestDescription: string;
  attendanceRequestDurationType: string;
  spheaderId: number;
  attendanceApprovalcomments: any[];
}
export interface ApprovalHeader {
  id: number;
  moduleId: number;
  referenceEntityId: number;
  status: string;
  currentapprovalStage: string;
  currentApproverId: string;
  finalapprovalStage: string;
  approvedType: string;
  requestedBy: number;
}
export interface Module {
  id: number;
  moduleName: string;
  approvalflowRequired: boolean;
  categoryType: string;
}
export interface PermissionRequestResponse {
  entity: PermissionRequest;
  approvalHeader: ApprovalHeader;
  module: Module;
  currentApprover: string;
}
export interface PermissionRequest {
  id: number;
  raisedFor: number;
  raisedForName: string;
  fusionempId: string;
  requestedBy: number;
  requestedDate: string; // ISO string
  createdDate: string;
  type: string;
  moduleId: number;
  referenceTypeId: number;
  duration: string; // Can be string or number depending on backend
  status: string;
  notes: string;
  headerId: number;
  regularizationApproverComments: any[]; // Define type if structured
}
export interface ApprovalStatusCount {
  moduleId: number;
  moduleName: string;
  forYou: number;
  forYourRole: number;
  totalCount: number;
}
export interface ILeavePolicyData {
  id: number
  year: number
  locationId: any
  subLocationId: number
  shiftId: number
  categoryId: number
  allowedDays: number
  entityType: string
  entityReferenceId: number
  status: string
  comments: string
  addedBy: number
  addedDate: Date
  lastModifiedBy: number
  lastModifiedDate: Date
}
export interface Igradeid {
  gradeId: number;
  gradeName: string;
  jobGrade: string;
  createdat: any;
  updatedat: any;
  isdeleted: string;
  maxDays: number;
  categoryId: number;
  lpId: number
}
export interface ExpenseApprovalResponse {
  entity: ExpenseEntity;
  approvalHeader: ApprovalHeader;
  module: Module;
  currentApprover: string;
}
export interface ExpenseEntity {
  expenses_ID: number;
  applied_date: string;
  expenses_Title: string;
  status: string;
  employeeId: number;
  fusionEmpId: string;
  employeeName: string;
  totalExpenseAmount: number;
  expenseType: string;
  pendingheaderId: number;
  expenseApproverComments: any[]; // Replace `any` with specific type if available
}
export interface IEligibilityCriteria {
  id: number;
  name: string;
  value: string;
}
export interface IPermissionType {
  id: number;
  name: string;
  type: string
  isDeleted: boolean,
  createdAt: any,
  updatedAt: any
}
export interface Ipermissions {
  name: string;
  isDeleted: boolean,
  type: string
}
export interface IPermissionsvalue {
  id: number;
  entity: string;
  attribute: string;
  value: string;
  meta: string;
}
export interface IRegularizationvalue {
  id: number;
  entity: string;
  attribute: string;
  value: string;
  meta: string;
}
export interface OrgShiftItem {
  id: number;
  headerID: number;
  shiftName: string;
  shiftStartTime: string;
  duration: number;
  shiftEndTime: string;
  shiftDescription: string;
  status: string;
  code: string;
  allowedGracePeriod: number;
  latesAllowed: number;
  allowedBreakTime: number;
  halfDayMinHrs: number;
  fullDayMinHrs: number;
}
export interface ShiftData {
  id: number;
  locationId: number;
  subLocationId: number;
  applicableyear: number;
  status: string;
  addedby: number;
  addedDate: string;
  statusCode: number;
  orgShiftsItems: OrgShiftItem[];
}
export interface Iorgcategoryleaves {
  id: any;
  applicableYear: any;
  locationID: any;
  subLocation: any;
  shiftId: any;
  type: any;
  name: string;
  categoryColor: string;
  categoryCode: string;
  allowedHalfDay: boolean;
  allowedGender: any;
  allowedMaritalStatus: any;
  excludeWeekends: boolean;
  excludeHolidays: boolean;
  futureDatesAllowed: boolean;
  futureDatesAllowedDays: any;
  pastDateAllowed: boolean;
  pastDatesAllowedDays: any;
  carryForwardAllowed: boolean;
  carryForwardAllowedType: boolean;
  carryForwardAllowedValue: any;
  encashAllowedType: boolean;
  encashAllowedValue: any;
  parentId: any;
  validity: any;
  status: string;
  addedBy: any;
  addedDate: any;
  lastModifiedBy: any;
  lastModifiedDate: any;
  shiftName: any;
  subLocationName: any;
  locationName: any;
  noticePeriodAllowedValue: any;
  noticeperiodAllowedType: any;
  isOptionalHoliday: boolean;
  isApplicableProRataLeave: any;
  probationDays: any;
  isProbationAllowed: any;
}
export interface OrgShiftItem {
  id: number;
  headerID: number;
  shiftName: string;
  shiftStartTime: string;
  duration: number;
  shiftEndTime: string;
  shiftDescription: string;
  status: string;
  code: string;
  allowedGracePeriod: number;
  latesAllowed: number;
  allowedBreakTime: number;
  halfDayMinHrs: number;
  fullDayMinHrs: number;
}
export interface ShiftData {
  id: number;
  locationId: number;
  subLocationId: number;
  applicableyear: number;
  status: string;
  addedby: number;
  addedDate: string;
  statusCode: number;
  orgShiftsItems: OrgShiftItem[];
}
export interface ApprovalStatusCount {
  moduleId: number;
  moduleName: string;
  forYou: number;
  forYourRole: number;
  totalCount: number;
}