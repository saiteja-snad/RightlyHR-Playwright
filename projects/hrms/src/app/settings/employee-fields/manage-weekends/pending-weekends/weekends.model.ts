export interface IWeekends {
    id: number;
    locationId: number;
    subLocationId: number;
    shiftID: number;
    applicableyear: number;
    status: string;
    addedby: number;
    addedDate: string;
    authorizedby: number;
    authorizedDate: string;
    authorizedstatus: string;
    lastModifedby: number;
    lastModifeddate: string;
    firstName: string;
    lastName: string;
    middleName: string;
    shiftName: string;
    jobSubLocationName: string;
    jobLocationName: string;
    orgWeekendItems: IOrgWeekendItem[];
}

export interface IOrgWeekendItem {
    id: number;
    weekday: string;
    headerId: number;
    firstweek: boolean;
    secondweek: boolean;
    thirdweek: boolean;
    fourthweek: boolean;
    fifthweek: boolean;
}

export interface ILocation {
    id: any,
    jobLocationName: string,
    isDeleted: boolean
    jobSubLocations: ISubLocation[]
    subLocations:ISubLocation[]
}
export interface ISubLocation {
    id: number,
    jobLocationId: any,
    jobSubLocationName: string,
    isDeleted: boolean,
    jobLocationName: string,
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