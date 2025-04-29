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
  
    currentaddressline1?: string;
    currentaddressline2?: string;
    currentcity?: string;
    currentstate?: string;
    currentcountry?: string;
    currentzipcode?: string;
  
    permanentaddressline1?: string;
    permanentaddressline2?: string;
    permanentcity?: string;
    permanentstate?: string;
    permanentcountry?: string;
    permanentzipcode?: string;
  
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
    jobeffectivedate?: string;
    jobRole?: string;
    departmentName?: string;
    subdepartment_name?: string;
    reportingmanager?: string;
  
    joblocationname?: string;
    jobsublocationname?: string;
  
    shiftname?: string;
    shiftcode?: string;
  
    compeffectivedate: string;
    overtimeeligibility: string;
    reason: string;
    frequency: string;
    paytype: string;
    compensationamount: number;
  }
  
