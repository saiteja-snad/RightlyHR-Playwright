export interface IAssessors {
  id: number;
  reviewCycleId: number;
  isDeleted: boolean;
  createdBy: any;
  createdAt: any;
  assessor: string;
  dueDate: any;
  isRatingVisible: boolean;
  isCommentsVisible: boolean;
  isView: boolean;
}
export interface IGetAssessors {
  headerId: any;
  reviewCycleId: number;
  reviewCycleName: string;
  locationNames: IlocationNames[];
  subLocationNames: IsubLocationNames[];
  departmentNames: IdepartmentNames[];
  subDepartmentNames: IsubDepartmentNames[];
}
export interface IlocationNames {
  locationId: number;
  locationName: string;
}
export interface IsubLocationNames {
  subLocationId: number;
  subLocationName: string;
}
export interface IdepartmentNames {
  departmentId: number;
  departmentName: string;
}
export interface IsubDepartmentNames {
  subDepartmentId: number;
  subDepartmentName: string;
}
export interface IReviewCycle {
  sno: number,
  departmentName: string;
  id: number;
  reviewCycleName: string;
  startDate: string;
  endDate: string;
  dueDate: string;
  reviewCycleType: string;
  applicableForIncrement: boolean;
  applicableEmployeesJoinedBefore: string;
  description: string;
  reviewTemplateId: number;
  reviewTemplateName: string;
  status: string;
  createdBy: number;
  createdByName: string;
  createdAt: string;
  departments: { departmentId: string, departmentName: string }[];
  locations: { locationId: string, locationName: string }[];
  subdepartments: { subDepartmentId: string, subDepartmentName: string }[];
  sublocations: { subLocationId: string, subLocationName: string }[];
}
export interface IDesignationNames {
  id: number;
  entity: string;
  attribute: string;
  value: string;
}
export interface Employee {
  employeeName: string;
  employeeId: number;
  fusionEmpId: string;
  workEmail: string;
}