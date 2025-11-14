export interface Category {
  id: number;
  name: string;
  applicableYear: number;
  locationID: number;
  shiftId: number;
  subLocation: number;
  type: number;
  categoryColor: string;
  categoryCode: string;
  leaveTypeId: number;
  // Add other fields as needed
}

export interface AttendanceLockCategory {
  category: Category;
  allowedDays: number;
  utilizedDays: number;
  booked: number;
}

export interface IAttendanceLockResponse {
  page: number;
  pageSize: number;
  totalCount: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  statusCounts: StatusCounts;
}

export interface ITimesheetLockItem {
  id: number;
  startDate: string; 
  createdDate: string;
  updatedDate: string;      
  endDate: string;         
  effectiveDate: string;  
  status: string;
  moduleId: number;
  module: Module;
  addedByEmployee: Employee;
}

export interface Module {
  moduleId: number;
  moduleName: string;
}

export interface Employee {
  empId: number;
  employeeName: string;
  employeeId: string;
  employeeWorkEmail: string;
}

export interface StatusCounts {
  [status: string]: number; 
}
