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
    middleName: string
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
    reportsto:string
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
    offerExpiryDate:Date
  }
    export interface IJob {
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
      gredeId: any,
      workPhoneCountryCode: string,
      mobilePhoneCountryCode: string,
      documnetUrl: string,
      offerIssueddate: any,
      offerstatus: string,
      documentUrl: string,
      employeeId: any,
      fusionEmpId: any
    }
    export interface Iprospective{
      employeeId: number,
      firstName: string,
      lastName:string,
      emailaddress: string,
      workEmail?:string
      effectivedate: any,
      contactnumber:any
      dob:any,
      empstatus:string
      isNotVisible: boolean;
      fusionEmpId?:string
  }
    export interface ITitle {
      sno: number,
      titlename: string;
      isdeleted:string;
  }
  
  export interface IGender {
      sno: number;
      genderName: string;
      isdeleted:string;
    }
  
    export interface ICountry{
      sno: number
      countryName: string
      currency: string
    }
    export interface IRole {
      sno: number,
      jobRole1: string;
      isdeleted: string;
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