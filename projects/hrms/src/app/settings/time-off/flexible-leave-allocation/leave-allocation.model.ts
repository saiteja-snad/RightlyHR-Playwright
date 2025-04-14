export interface ILocation {
    id: any,
    jobLocationName: string,
    isDeleted: boolean
    jobSubLocations: ISubLocation[]
}
export interface ISubLocation {
    id: number,
    jobLocationId: any,
    jobSubLocationName: string,
    isDeleted: boolean,
    jobLocationName: string,
}
export interface IEmployees {
    id: number;
    wfhManagerId: number;
    employeeId: number;
    fusionEmpId: string;
    emailAddress: string;
    empStatus: string;
    reportingManagerEmailAddress: string;
    effectiveDate: string;
    jobRole: string;
    status: string;
    subdepartmentId: number;
    subdepartmentName: string;
    departmentId: number;
    reportingmanagerId: number;
    departmentName: string;
    locationId: number;
    subLocationId: number;
    locationName: string;
    sublocationName: string;
    shiftName: string;
    firstName: string;
    lastName: string;
    middleName: string;
    fName: string;
    lName: string;
    mName: string;
    shiftId: number;
}
export interface IShiftHeader {
    id: number;
    locationId: number;
    subLocationId: number;
    applicableyear: number;
    status: string;
    addedby: number;
    addedDate: string; 
    statusCode: number;
    orgShiftsItems: IShiftItem[];
}
export interface IShiftItem {
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
export interface ICategoryDetails {
    id: number;
    applicableYear: number;
    locationID: number;
    subLocation: number;
    shiftId: number;
    type: number;
    name: string;
    locationName: string;
    subLocationName: string;
    noticeperiodAllowedType: boolean;
    noticePeriodAllowedValue: number;
    shiftName: string;
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
    isDefault: boolean;
    isProbationAllowed: boolean;
    probationDays: number;
    isApplicableProRataLeave: boolean;
    isOptionalHoliday: boolean;
}
