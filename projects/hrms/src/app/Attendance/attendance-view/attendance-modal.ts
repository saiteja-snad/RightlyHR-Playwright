export interface IAttendance {
    employeeId: number,
    date: Date,
    firstLogin: Date,
    lastLogout: Date,
    duration: any,
    status: string,
    colour: string,
    subStatus?: [],
    tags: Itags[],
    dayLogs: IdayLogs[],
    biometricLogs: [],
    permissions: [],
    regularizations: [],
    logExtraHours: [],
    displayStatus: any,
    isRegularizationApplicable: boolean,
    isLeaveApplicable: boolean,
    shiftDetails?: {
        id: number;
        headerId: number;
        shiftStartTime: string;
        shiftEndTime: string;
        allowedGracePeriod: number;
        latesAllowed: number;
        allowedBreakTime: number;
        halfDayMinHrs: number;
        fullDayMinHrs: number;
        punchBeginBefore: number;
        punchEndAfter: number;
        locationId: number;
        subLocationId: number;
    };
}
export interface IdayLogs {
    in: any;
    out: any;
    duration: any;
}
export interface Itags {
    name: string;
    order: any;
    colour: string;
    additionalInfo?: any;
}