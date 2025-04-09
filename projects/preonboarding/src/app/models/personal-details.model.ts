export interface Ipersonal {
    firstName: string,
    lastName: string,
    maritalStatus: string,
    empstatus: string,
    emailaddress: string,
    supervisor: any,
    gender: string,
    dob: any,
    createdby: string,
    updatedby: string,
    immigrationstatus: string,
    contactnumber: any,
    addressLine1: string,
    addressLine2: string,
    city: string,
    state: string,
    zipCode: any,
    country: string,
    ssn: any,
    taxFileNumber: any,
    emergencynumber: any,
    location: string,
    comments: string,
    employementstatus: string,
    title: string,
    nationalId: any,
    profilePic: string,
    secondaryLanguage: string,
    addressId: any,
    workPhone: any,
    mobilePhone: any,
    workEmail: string,
    homeEmail: string,
    bankName: string,
    accountNumber: any,
    userName: string,
    password: string,
    confirmPassword: string,
    ifscCode: any,
    proof: string,
    dateOfJoining: any,
    probationEndDate: string,
    probationStatus: string,
    noticePeriod: string,
    backgroundCheckStatus: string,
    emergencyName: string,
    relationShip: string,
    emailId: string,
    mobileNumber: any,
    termtypeoffboard: string,
    termreasonoffboard: string,
    eligibleforrehire: string,
    lastworkingday: any,
    img: string,
    reportsto: string,
    isManager: true,
    gradeId: any,
    workPhoneCountryCode: string,
    mobilePhoneCountryCode: string,
    documnetUrl: string,
    offerIssueddate: any,
    offerstatus: string,
    documentUrl: string,
    emergencycode: string,
    employeeId: any,
    fusionEmpId: string;
    isNotVisible: boolean;
    emergencyName1: string
    emergencyEmail1: string
    emergencycode1: number
    emergencyNumber1: number
    relationship1: string
    branchCode: string
    employeeAddresses?: IAddress[]
    isCredentialExpired: boolean
}

export interface IAddress {
    id?: number;
    empId?: number;
    type: string;
    addressLine1: string;
    addressLine2: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    emp?: any;
}

export interface IIdentity {
    identityId: number,
    empId: number,
    identityType: string,
    identityNumber: string,
    attachment: string,
    isDeleted: boolean
}

export interface IGender {
    sno: number,
    genderName: String,
    isdeleted: String
}

export interface ITitle {
    sno: number,
    titlename: string;
    isdeleted: string;
}

export interface IJobdetails {
    subdeptId: any;
    id: number,
    employeeId: any,
    effectiveDate: string,
    reportsto: any,
    department: string,
    bussinessArea: string,
    lopcation: string,
    jobRole: string,
    status: string,
    firstName: string,
    lastName: string,
    subLocation: string
}