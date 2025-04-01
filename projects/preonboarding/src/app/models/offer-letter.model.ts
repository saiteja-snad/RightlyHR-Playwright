export interface Iofferletter {
    id: number,
    empId: number,
    offerSentDate: any,
    offerSentStatus: string,
    offerSentBy: number,
    documentUrl: string,
    isdeleted: boolean,
    status: string,
    approvedDate: any,
    approvedBy: any,
    approver: any,
    comments: string,
    candidateStatus?: string
    candidateComments?: string
}

export interface IJobDetails {
    id: number,
    employeeId: number,
    effectiveDate: null,
    department: null,
    bussinessArea: null,
    lopcation: string,
    jobRole: string,
    status: string,
    subLocation: string,
    createddate: any,
    updateddate: any,
    subdeptId: null
}

export interface IemployeeDetails {
    firstName: string,
    lastName: string,
    maritalStatus: string,
    empstatus: string,
    emailaddress: any,
    supervisor: string,
    gender: string,
    dob: any,
    createdby: any,
    updatedby: any,
    contactnumber: number,
    taxFileNumber: number,
    emergencynumber: any,
    location: any,
    title: string,
    nationalId: any,
    secondaryLanguage: string,
    workPhone: number,
    mobilePhone: number,
    workEmail: string,
    homeEmail: string,
    userName: string,
    password: any,
    confirmPassword: any,
    dateOfJoining: any,
    probationEndDate: any,
    probationStatus: string,
    noticePeriod: any,
    backgroundCheckStatus: string,
    employeeAddresses: []
}

export interface IAddress {
    id: number,
    empId: number,
    type: string,
    addressLine1: string,
    addressLine2: string,
    city: string,
    state: string,
    zipCode: string,
    country: string
}