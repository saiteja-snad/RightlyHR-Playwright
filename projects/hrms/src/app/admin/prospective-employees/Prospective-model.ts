export interface Iprospective{
    id: number,
    employeeId: number,
    firstName: string,
    lastName:string,
    middleName:string,
    emailaddress: string,
    workEmail?:string
    effectivedate: any,
    contactnumber:any
    dob:any,
    isNotVisible: boolean;
    fusionEmpId?:string
    substatus:string;
    empstatus:string;
    jobDetails?:IJobdetails[];
    sublocation?:string;
    lopcation: string,
    jobRole: string,
}
export interface IRole {
    sno: number,
    jobRole1: string;
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
    firstName:string,
    lastName:string,
    subLocation:string,
    sublocationid:any,
    locationid:any,
  }