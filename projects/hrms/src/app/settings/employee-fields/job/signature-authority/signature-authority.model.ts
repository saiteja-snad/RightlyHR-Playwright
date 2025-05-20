export interface IemployeeDetails {
  firstName: string;
  lastName: string;
  middleName: string;
  workPhone: number;
  maritalStatus: string;
  empstatus: string;
  emailaddress: string;
  gender: string;
  dob: string;
  contactnumber: number;
  emergencynumber: number;
  title: string;
  workEmail: string;
  password: string;
  dateOfJoining: string;
  probationEndDate: string;
  emergencyName: string;
  relationShip: string;
  emailId: string;
  isManager: string;
  workPhoneCountryCode: string;
  mobilePhoneCountryCode: string;
  employeeId: number;
  fusionEmpId: string;
  emergencycode: string;
  emergencyName1: string;
  emergencyEmail1: string;
  emergencycode1: string;
  emergencyNumber1: number;
  relationship1: string;
  pf: string;
  esic: string;
  pt: boolean;
  azureAdId: string;
  insurance: boolean;
  bloodGroup: string;
  expirationTime: string;
  substatus: string;
  experienceType: string;
  bgc: boolean;
  isCredentialExpired: boolean;
  empType: string;
  fullName?: string;
}

export interface ISignatureAuthority {
  id: number;
  entity: string;
  attribute: string;
  value: string;
}

export interface ISignatureList {
  authorizedSignatureEmployeeId: number;
  isdeleted: boolean;
  letterType: string;
}
