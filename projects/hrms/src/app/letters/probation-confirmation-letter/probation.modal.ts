export interface IJobDetails {
    id: number;
    employeeId: number;
    lopcation: string; 
    jobRole: string;
    status: string;
    subLocation: string;
    shiftName: string;
  }
  
 export interface IEmployee {
    firstName: string;
    lastName: string;
    middleName: string;
    maritalStatus: string;
    empstatus: string;
    emailaddress: string;
    gender: string;
    dob: string;
    contactnumber: number;
    title: string;
    workPhone: number;
    workEmail: string;
    emergencyName: string;
    relationShip: string;
    emailId: string;
    mobileNumber: number;
    isManager: boolean;
    employeeId: number;
    fusionEmpId: string;
    emergencycode: string;
    emergencyName1: string;
    emergencyEmail1: string;
    emergencycode1: string;
    emergencyNumber1: number;
    relationship1: string;
    issalaryhold: boolean;
    pf: boolean;
    esic: boolean;
    pt: boolean;
    insurance: boolean;
    profileUrl: string;
    bloodGroup: string;
    substatus: string;
    bgc: boolean;
    isCredentialExpired: boolean;
    allowWFH: boolean;
    empType: string;
    departmentId: number;
    departmentName: string;
    dateOfJoining : string;
    jobDetails: IJobDetails;
  }
  