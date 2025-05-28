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
    displayStatus:any,
    isRegularizationApplicable: boolean,
    isLeaveApplicable: boolean,
}
export interface IdayLogs {
    in: any;
    out: any;
    duration: any;
}
export interface Itags {
    name: string;
    order: any;
    colour: any;
}