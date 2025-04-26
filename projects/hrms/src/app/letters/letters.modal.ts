export interface IEmployeeDetails {
    firstName: string;
    lastName: string;
    middleName?: string;
    workPhone: number;
    maritalStatus: string;
    empstatus: string;
    emailaddress: string;
    gender: string;
    dob: string;
    contactnumber: number;
    addressLine1: string;
    addressLine2: string;
    city: string;
    state: string;
    country: string;
    title: string;
    workEmail: string;
    dateOfJoining: string;
    lastworkingday: string;
    probationEndDate?: string;
    noticePeriod: string;
    emergencyName: string;
    relationShip: string;
    emailId: string;
    mobileNumber: number;
    isManager: boolean;
    employeeId: number;
    wfhManagerId?: number;
    fusionEmpId: string;
    emergencycode: string;
    emergencyName1?: string;
    emergencyEmail1?: string;
    emergencycode1?: string;
    emergencyNumber1?: number;
    relationship1?: string;
    profileUrl?: string;
    bloodGroup?: string;
    bgc: boolean;
    workLocation: string;
    allowWFH: boolean;
    mobilephonecountryflag?: string;
    workphonecountryflag?: string;
    emergencynumbercountryflag?: string;
    emergencyphonecountryflag?: string;
    contactnumbercountryflag?: string;
    marriedDate?: string;
}

export interface IEmployeeJobDetails {
    id: number;
    employeeId: number;
    effectiveDate: string;
    department: string;
    lopcation: string;
    jobRole: string;
    status: string;
    subLocation: string;
    createddate: string;
    updateddate: string;
    subdeptId: number;
    reportsto: number;
    teamManagerId: number;
    shiftId: number;
    locationid: number;
    sublocationid: number;
    jobTypeId: number;
    gradeId: number;
}

export interface IEmployeeSignatures {
    employeeId: number;
    firstName: string;
    lastName: string;
    middleName: string;
    designation: string;
}

