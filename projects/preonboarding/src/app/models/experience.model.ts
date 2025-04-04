export interface IEmpExperience {
    id: number,
    empId: number,
    companyName: string,
    jobTitle: string,
    fromDate: any,
    toDate: any,
    description: string,
    employmentType: string,
    isDeleted: Boolean,
    createdAt: any,
    updatedAt: any,
    attachment: string,
    previousContactName: string,
    previousContactNumber: string,
    countryCode: string,
    isPresent: boolean,
    previousContactEmail: string,
}

export interface Ipersonal {
    firstName: string,
    lastName: string,
    middleName: string,
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
    bloodGroup: string
}

export interface IJobtype {
    sno: number,
    jobType1: string;
    isdeleted: string;
    empid: number,
    empEffectiveDate: any,
    empComments: string,
    gradeId: number,
    gradeName: string,
    jobGrade: string,
}

export interface IRole {
    sno: number,
    jobRole1: string;
    isdeleted: string;
}
