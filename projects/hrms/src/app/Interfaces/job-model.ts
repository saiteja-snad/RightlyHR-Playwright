export interface IJob {
    employeeId: any,
    firstName?: string,
    lastName?: string,
    middleName?:string,
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
    trainingEndDate: any,
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
    reportsto: number,
    isManager: true,
    gredeId: any,
    workPhoneCountryCode: string,
    mobilePhoneCountryCode: string,
    documnetUrl: string,
    offerIssueddate: any,
    offerstatus: string,
    documentUrl: string,
   
    fusionEmpId: any
    noduerequestpassed:any,
  }
  export interface IemployeeDetails {
    fusionEmpId: any;
    employeeId: any;
    accountNumber:number
  
    addressId:number
  
    addressLine1:any
  
    addressLine2:any
  
    backgroundCheckStatus:string
   
    bankName:string
   
    city:string
    comments:string
    confirmPassword:any
  
    contactnumber:number
    country:string
  
  
  
    dateOfJoining:any
    dob:any
    documentUrl:any
   
    
    eligibleforrehire:string
    emailId:number
    emailaddress:any
    
    
    emergencyEmail1:string
  
    emergencyName:string
   
    emergencyName1: string
    emergencyNumber1: number
    emergencycode: any
    emergencycode1: any
    emergencynumber: any
  
    employementstatus: string
    empstatus: string
    firstName: string
    gender: string
    gradeId: number
    homeEmail: string
    ifscCode: any
    img: any
    immigrationstatus: any
    isManager: boolean
    lastName: string
    lastworkingday: any
    location: any
    maritalStatus: string
    mobileNumber: number
    mobilePhone: number
    mobilePhoneCountryCode: number
    nationalId: any
    noticePeriod: any
    offerIssueddate: any
    offerstatus: string
    password: any
    probationEndDate: any
    probationStatus: string
    profilePic: any
    proof:any
    relationShip: string
    relationship1:string
    reportsto:number
    secondaryLanguage:string
    ssn:string
    
    state:string
   
    supervisor:string
   
    taxFileNumber:number
   
    termreasonoffboard:string
  
    termtypeoffboard:string
   
    title:string
   
    updatedby:any
   
    userName:string
   
    workEmail:string
    
    workPhone:number
  
    workPhoneCountryCode:number
    
    zipCode:number
  }
  export interface IWfh {
    id: string,
    concurrencyStamp: string,
    firstName:string,
    lastName:string,
    middleName:string,
    employeeId: any,
    fusionEmpId:any,
    normalizedName: string
  }
  export interface IEmployeement {
    id: number,
    empid: number,
    jobType: string,
    gradeId: any,
    gradeName: string,
    jobGrade: any,
    empEffectiveDate: any,
    empComments: string,
    isdeleted: string,
  }
  export interface IJobdetails {
gradeName: any;
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
    firstName:string,
    lastName:string,
    subLocation:string
    sublocationid:any,
    locationid:any,
    shiftId:any;
    gradeId:any;
    jobTypeId:any;
    teamManagerId : any;
  }
  export interface Icompensation {
    employeeId: number,
    id: number,
    compeffectivedate: any,
    overtimeeligibility: string,
    reason: string,
    compensationcomments: string,
    frequency: string,
    paytype: string,
    compensationamount: number,
    status: string
  }
  
  
  export interface INotice {
    id: number,
    period: string;
    isdeleted: string;
  }export interface IProbation {
    sno: number,
    probationstatus1: string,
    isdeleted: string,
  }
  export interface IBackground {
    sno: number,
    backgroundcheckstatus1: string;
    isdeleted: string;
  }
  
  export interface IFrequency {
    sno: number,
    frequency1: string,
    isdeleted: string,
  }
  
  export interface IPayType {
    sno: number;
    paytype1: string;
    isdeleted: string;
  
  }
  
  
  export interface IOvertime {
    sno: number;
    overtimeeligibility1: string;
    isdeleted: string;
  }
  
  export interface IBusiness {
    sno: number;
    areaName: string;
    isdeleted: string;
  
  }
  
  export interface ITermination {
    sno: number,
    reason: string,
    isdeleted: string
  }
  
  
  export interface IRehiredata {
    sno: number;
    eligibleforrehire1: string;
    isdeleted: string;
  }
  
  export interface IJobtype {
    sno: number,
    jobType1: string;
    isdeleted: string;
  }
  
  export interface IRole {
  
    id: any;
    sno: number,
    jobRole1: string;
    designationName: string;
    isdeleted: string;
    gradeId:any
  }
  
  
  export interface IDepartment {
    sno: number,
    departmentName: string;
    isdeleted: string;
  }
  
  export interface IGrade {
    gradeId: number,
    gradeName: string,
    jobGrade: any,
  
    isdeleted: string,
  
  
  }
  
  export interface IJobgrade {
    rateId: number,
    country: string,
    billableRate: any,
    costRate: string,
    currency: string,
    gradeId: number,
    isdeleted: string,
  }
  
  export interface ICompensation {
    sno: number,
    reason: string;
    isdeleted: string;
  }
  export interface IRate {
    // rateID: number,
    gradeName: string,
    jobGrade: string,
  
    rateId: any,
    country: string,
    billableRate: any,
    currency: string,
    gradeId: any,
  
    isdeleted: string,
    costRate: number
  }
  
  export interface ICountryCurrency {
  
    sno: number,
    countryName: string,
    currency: string
  }
  export interface IAppointmentinfo {
    appointStatus1:string
  isDeleted:Boolean
  sno:number
  }
  export interface IOfferinfo {
    sno: number,
    offerStatus1: string,
    isDeleted: Boolean
  }
  export interface IAssestsinfo{
    
    sno: number,
    assetType1: string,
    isDeleted: Boolean
  }
  export interface IMakeinfo{
    
    sno: number,
    makeName: string,
    isDeleted: Boolean
  }
  export interface IAssertsType{
    id: number,
      empid: number,
      assetType: string,
      maker: string,
      model: any,
      serialNumber: any,
      isdeleted: Boolean
  }
  export interface IEmpExperience{
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
     previousContactEmail:string,
  }
  
  export interface EmpCertificates{
    id: number,
    empId: number,
    certificationName: string,
    issuedDate: any,
    expirationDate: any,
    certificationId: string,
    attachment: string,
    isDeleted: Boolean,
    createdAt: any,
    updatedAt: any,
    isExpired: boolean,
    }
    export interface InoDue{
      employeeId: number,
      firstName: string,
      lastName: string,
      middleName: string,
      effectiveDate: any,
      description: null,
      lastWorkingDate: any,
      department: string,
      lopcation: string,
      jobRole: string,
      shiftId: number,
      sublocationid: number,
      appliedDate: any,
      noticePeriodDuration: number,
      status: string,
      comments: any,
      isDeleted: boolean,
      recallReason: any,
      reasonForEarlyRelieving: any,
      recallStatus: string,
      isEarlyRelieving: boolean,
      earlyRelievingDate: any,
      processedDate: any,
      isAcceptEarlyRelieving: boolean
  }
