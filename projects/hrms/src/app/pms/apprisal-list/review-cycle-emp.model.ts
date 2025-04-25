export interface IReviewCycleEmployee {
    id: number;
    reviewCycleName: string;
    startDate: string;
    endDate: string;
    reviewCycleType: string;
    applicableForIncrement: boolean;
    applicableEmployeesJoinedBefore: string;
    description: string;
    status: string;
    createdBy: number;
    createdByName: string;
    employeeIds: string;
    createdAt: string;
    locations: ILocation[];
    sublocations: ISubLocation[];
    departments: IDepartment[];
    subdepartments: ISubDepartment[];
    employeeidsdetails: IEmployeeDetail[];
  }
  
  export interface ILocation {
    locationId: string;
    locationName: string;
  }
  
  export interface ISubLocation {
    locationId: string;
    subLocationId: string;
    subLocationName: string;
  }
  
  export interface IDepartment {
    departmentId: string;
    departmentName: string;
  }
  
  export interface ISubDepartment {
    departmentId: string;
    subDepartmentId: string;
    subDepartmentName: string;
  }
  
  export interface IEmployeeDetail {
    employeeName: string;
    employeeId: number;
    fusionEmpId: string;
    workEmail: string;
  }
  