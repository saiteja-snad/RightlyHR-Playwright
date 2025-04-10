export interface ICompOff {
    id: number;
    empId: number;
    startTime: string; // ISO Date string
    endTime: string;   // ISO Date string
    requestedComments: string;
    durationType: number;
    duration: number;
    status: string;
    reason: string;
    requestedCategory: number;
    requestedBy: number;
    requestedDate: string; // ISO Date string
    validUpto: string;     // ISO Date string
  }
  

  export interface OrgHolidayItem {
    id: number;
    headerID: number;
    holidayName: string;
    holidayDate: string; // ISO Date string
    holidayColor: string;
    holidayIcon: string;
    isOptional: boolean;
    status: string;
  }
  
  export interface OrgHolidayHeader {
    id: number;
    locationId: number;
    subLocationId: number;
    shiftID: number;
    applicableyear: number;
    status: string;
    addedby: number;
    addedDate: string; // ISO Date string
    authorizedby: number;
    authorizedDate: string; // ISO Date string
    authorizedstatus: string;
    lastModifedby: number;
    lastModifeddate: string; // ISO Date string
    orgHolidaysItems: OrgHolidayItem[];
  }


  export interface OrgWeekendItem {
    id: number;
    weekday: string;
    headerId: number;
    firstweek: boolean;
    secondweek: boolean;
    thirdweek: boolean;
    fourthweek: boolean;
    fifthweek: boolean;
  }
  
  export interface OrgWeekendHeader {
    id: number;
    locationId: number;
    subLocationId: number;
    shiftID: number;
    applicableyear: number;
    status: string;
    addedby: number;
    addedDate: string; // ISO Date string
    authorizedby: number;
    authorizedDate: string; // ISO Date string
    authorizedstatus: string;
    lastModifedby: number;
    lastModifeddate: string; // ISO Date string
    orgWeekendItems: OrgWeekendItem[];
  }
  
  