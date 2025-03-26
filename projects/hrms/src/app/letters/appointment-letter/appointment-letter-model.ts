
export interface IemployeeDetails {
    middleName: any;
    fusionEmpId: any;
    fusionEmployeeId:any;
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
    //middleName: string
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
    designation:any;
    Jobdetails:IJobDetailes[]
}

  export interface IJobDetailes {
    employeeId: number;
    location: string;
    subLocation: string;
    jobRole: string;
    department: string;
  }


export interface IEmployeeDetails{
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
    middleName:string
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
}

export interface IDepartment {
    sno: number,
    departmentName: string;
    isdeleted: string;
  }
  export interface IMake{

    sno: number,
    makeName: string,
    isDeleted: boolean
  }
  export interface IIssuelocation{
    sno: number,
    issuedLocation: string,
    isDeleted: boolean
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