export interface ILocation {
    id: any,
    jobLocationName: string,
    isDeleted: boolean
    jobSubLocations: ISubLocation[]
}
export interface ISubLocation {
    id: number,
    jobLocationId: any,
    jobSubLocationName: string,
    isDeleted: boolean,
    jobLocationName: string,
}

export interface ILocationReportData {
    employeeId: number;
    fusionEmpId?: string;
    title: string;
    firstName: string;
    middleName: string;
    lastName: string;
    empstatus: string;
    maritalStatus: string;
    gender: string;
    dob: string;
    bloodGroup?: string;
  
    currentAddressLine1?: string;
    currentAddressLine2?: string;
    currentCity?: string;
    currentState?: string;
    currentCountry?: string;
    currentZipCode?: string;
  
    permanentAddressLine1?: string;
    permanentAddressLine2?: string;
    permanentCity?: string;
    permanentState?: string;
    permanentCountry?: string;
    permanentZipCode?: string;
  
    workPhone: number;
    contactnumber: number;
    workEmail: string;
    emailaddress: string;
  
    emergencyName?: string;
    emailId?: string;
    emergencynumber: number;
    relationShip: string;
  
    emergencyName1: string;
    emergencyEmail1?: string;
    emergencyNumber1: number;
    relationship1: string;
  
    degree: string;
    university: string;
    specialization: string;
    gpa: number;
    degreeStartDate: string;
    degreeEndDate: string;
  
    visatype: string;
    issuedcountry: string;
    issueddate: string;
    expirydate: string;
    ssn?: string;
    driversLicense?: string;
  
    bankName: string;
    accountName: string;
    accountNo: number;
    ifscCode: string;
  
    offerSentDate?: string;
    offerSentBy?: string;
    offerSentStatus?: string;
  
    appointmentSentDate: string;
    appointmentSenyBy?: string;
    appointmentSentStatus: string;
  
    dateOfJoining: string;
    probationEndDate: string;
    probationStatus: string;
  
    branchCode?: string;
    noticePeriod: string;
    backgroundCheckStatus: string;
    healthInsurance?: string;
  
    lastworkingday: string;
    eligibleforrehire: string;
    termreasonoffboard: string;
  
    jobType?: string;
    gradeName?: string;
    jobEffectiveDate?: string;
    jobRole?: string;
    departmentName?: string;
    subdepartment_name?: string;
    teamManager?: String;
    reportingManager?: string;
  
    jobLocationName?: string;
    jobSubLocationName?: string;
  
    shiftName?: string;
    shiftCode?: string;
  
    compeffectivedate: string;
    overtimeeligibility: string;
    reason: string;
    frequency: string;
    paytype: string;
    compensationamount: number;
  }
  
