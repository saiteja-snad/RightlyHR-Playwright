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
    parentId:any,
    validity: any,
    status: string,
    addedBy: any,
    addedDate: any,
    lastModifiedBy: any,
    lastModifiedDate: any,
    shiftName: any,
    subLocationName: any,
    locationName: any
    noticePeriodAllowedValue:any,
    noticeperiodAllowedType:any,
    isOptionalHoliday:boolean,
    isApplicableProRataLeave:any
    probationDays:any,
    isProbationAllowed:any,
}
export interface ICategoryDetails{
    category:Iorgcategoryleaves,
    allowedDays: number,
    utilizedDays: number,
    booked:number,
    categoryColor: any,
    profileColor: '#06274F',
    duration:number,

    probationLeaves:number,
    noticePeriodLeaves:number

}

export interface Ileavesdatas {
    requestedBy: any;
    isNotVisible: boolean;
    employeeId: any,
    leaveType: any,
    duration: any,
    startdate: any,
    enddate: any,
    notes: any,
    status: any,
    id: any,
    Time: number,
    isDaytype: boolean,
    leavesapplied: number,
    remainingleaves: number,
    leavePolicyId: number,
    categoryId: any,
    durationType: any,
    date: any,
    categoryName: string;
    isdeleted: boolean;
    requestType?: string,
    refModule: string,
    refEntityId: number,
    leavesTaken: number,

}


export interface Ilpid {
    employeeId: any,
    leaveType: any,
    duration: any,
    startdate: any,
    enddate: any,
    notes: any,
    status: any,
    id: any,
    Time: number,
    leavePolicyId: number,
    categoryName: string;
    categoryId: number;
    date: any,
    isdeleted: string;
    rejectedReason: string;
    actualStatus: string;
    durationType: any,

}

export interface ILeaves{
    custompolicyleaves: any;
    remainingLeaves: number;
    totalLeaves: number;
    categoryName:string;
    categoryId:number;
    gradeId:number;
    maxDays:number;
    lpId:number;
    leavesTaken:number
  }

  
export interface ILeavesTaken {
    id: number,
    employeeId: number;
    leavePolicyId: number;
    leavesTaken: number;
    remainingLeaves: number;
    totalleaves:number;
  }