export interface ICategoryDetails {
    category: Iorgcategoryleaves,
    allowedDays: number,
    utilizedDays: number,
    booked: number,
    duration: number,
    probationLeaves: number,
    noticePeriodLeaves: number
}

export interface Iorgcategoryleaves {
    id: any,
    applicableYear: any,
    locationID: any,
    subLocation: any,
    shiftId: any,
    type: any,
    name: string,
    categoryColor: string,
    categoryCode: string,
    allowedHalfDay: boolean,
    allowedGender: any,
    allowedMaritalStatus: any,
    excludeWeekends: boolean,
    excludeHolidays: boolean,
    futureDatesAllowed: boolean,
    futureDatesAllowedDays: any,
    pastDateAllowed: boolean,
    pastDatesAllowedDays: any,
    carryForwardAllowed: boolean,
    carryForwardAllowedType: boolean,
    carryForwardAllowedValue: any,
    encashAllowedType: boolean,
    encashAllowedValue: any,
    parentId: any,
    validity: any,
    status: string,
    addedBy: any,
    addedDate: any,
    lastModifiedBy: any,
    lastModifiedDate: any,
    shiftName: any,
    subLocationName: any,
    locationName: any
    noticePeriodAllowedValue: any,
    noticeperiodAllowedType: any,
    isOptionalHoliday: boolean,
    isApplicableProRataLeave: any
    probationDays: any,
    isProbationAllowed: any,
}
export interface ICategoryDetails {
  category: Iorgcategoryleaves;
  allowedDays: number;
  utilizedDays: number;
  booked: number;
  categoryColor: any;
  profileColor: '#06274F';
  duration: number;

  probationLeaves: number;
  noticePeriodLeaves: number;
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