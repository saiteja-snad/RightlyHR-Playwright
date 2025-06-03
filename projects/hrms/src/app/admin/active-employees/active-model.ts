export interface Iactive {
  fullName: any;
  durationOfTrainee: any;
  noticePeriod: any;
  employeeId: number,
  firstName: string,
  lastName: string,
  middleName: string,
  emailaddress: string,
  effectivedate: any,
  contactnumber: number,
  mobilePhoneCountryCode:any,
  dob: any,
  empstatus: string
  isNotVisible: boolean;
  fusionEmpId: string;
  workEmail?: string
  substatus?: string;
  jobRole?: string;
  subLocation?: string;
  location?: string;
  jobDetails?: IJobdetails[];
  shiftName?: string;
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
  firstName: string,
  lastName: string,
  subLocation: string,
  shiftName?: string;
}