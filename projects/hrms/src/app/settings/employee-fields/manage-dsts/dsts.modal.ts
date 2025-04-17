export interface DayLightEntry {
    id?: number;
    headerId?: number;
    startDate: string; // or Date if you prefer
    endDate: string;   // or Date
    momentType: string;
    duration: number;
  }
  
  export interface ManageDST {
    id?: number;
    lastModifiedDate: string; // or Date
    addedDate: string;        // or Date
    status: string;
    addedBy: number;
    lastModifiedBy: number;
    applicableYear: number;
    sublocationId: number;
    shiftId: number;
    locationId: number;
    firstName?: string;
    lastName?: string;
    middleName?: string;
    shiftName?: string;
    jobSubLocationName?: string;
    jobLocationName?: string;
    dayLight: DayLightEntry[];
  }
  