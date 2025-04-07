export interface Ipersonal {
  separationType: string;
    bgc: any;
    status: any;
    remoteLogin: any;
    totalExperience: any;
    pt: any;
    esic: any;
    pf: any;
    workLocation: any;
    allowWFH: any;
    issalaryhold: any;
    isActive: any;
    isDeleted: any;totalYearsOfExperience: any;
    salaryHold: any;
    branchLocation: any;
    trainingDuration: any;
    firstName: string,
    lastName: string,
    middleName: string,
    maritalStatus: string,
    empstatus: string,
    emailaddress: string,
    experienceType: string
    supervisor: any,
    substatus: string,
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
    bloodGroup: string
    empType: string;
    employeeAddresses?: IAddress[]
    trainingEndDate: any;
}
export interface IStatus {

    sno: number,
    statusname: String,
    isdeleted: String
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
export interface IMarital {
    sno: number,
    maritalstatus1: string;
    isdeleted: string;
}
export interface IRelation {
    sno: number,
    relationship1: string,
    isdeleted: string
    isDependent?: boolean
}
export interface IDegre{
    sno: number;
    degreeName: string;
    isdeleted: string;
  }
export interface Ieducation {
    id: number
    employeeId: any,
    degree: string,
    university: string,
    specialization: string,
    gpa: number,
    degreeStartDate: any,
    degreeEndDate: any
    status: string
    attachment: string
}

export interface Ivisaupdate {
    id: any;
    employeeId: number,
    visatype: string,
    issuedcountry: string,
    issueddate: any,
    expirydate: any,
    vstatus: string,
    notes: string,
    visatype1: string,
    status?: string
}
export interface ICountry {
    countryName: string,
}

export interface Ibank {
    sno: number,
    bankName1: string,
    isdeleted: string
}

export interface Ibankdetails {
    bankId: number,
    empId: number,
    accountNo: number,
    accountName: string,
    ifscCode: string,
    docUrl: string,
    isDeleted: boolean,
    bankName: string,
    isPrimary: boolean
}
export interface Iidentity {
    identityId: number,
    empId: number,
    identityType: string,
    identityNumber: string,
    attachment: string,
    isDeleted: boolean
}
export interface Iidentitydrop {
    sno: number,
    identityType1: string,
    documentName: string
    isDeleted: boolean
}

export interface IBranchLocation {
    sno: number,
    branchCode: string,
    branchLocation1: string,
    isDeleted: boolean
}
export interface Idocsdetail {

    id: number,
    empId: number,
    documentType: string,
    documentUrl: string,
    status: string,
    rejectedBy: number,
    reason: string,
    comments: string
}