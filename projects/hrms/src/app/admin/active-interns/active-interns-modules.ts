export interface ITrainee{
    employeeId: number,
    firstName: string,
    lastName:string,
    middleName:string,
    emailaddress: string,
    effectivedate: any,
    contactnumber:number
    dob:any,
    empstatus:string
    isNotVisible: boolean;
    fusionEmpId:string;
    workEmail?:string
    substatus?:string;
    jobRole?:string;
    subLocation?:string;
    location?:string;
    jobDetails?:IJobdetails[] ;
    shiftName?:string;
    durationOfTrainee:any;

  
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
    firstName:string,
    lastName:string,
    subLocation:string,
    shiftName?:string;
  }