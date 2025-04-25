export interface Iglobalpermissions {
  firstName: string;
  lastName: string;
  middleName: string;
  requestedBy: string;
  requestedDate: Date;
  requestType: string;
  location: string;
  sublocation: string;
  Department: string;
  Team: string;
  duration: any;
  processedComment: string;
  meta: string;
  employeeIds: Iemployyes[];
  type: string;
  selectType: string;
  permissionRequestedDate: string;
  deptId_locationIdName: string;
  teamId_sublocIdName: string;
  fusionEmpId: string;
}
export interface Iemployyes {
  firstName: string;
  lastName: string;
  employeeId: number;
  fusionEmpId: string;
}
