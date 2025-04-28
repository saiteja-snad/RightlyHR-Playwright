export interface INoDue {
  id: number;
  authorityEntityValue: string;
  employeeNames: string;
  status: string;
  createdBy: number;
  updatedBy: number;
  createdAt: string;
  updatedAt: string;
  approverType: string;
  roleName: string;
  departmentId: number;
  departmentName: string;
}

export interface IDepartment {
  sno: number,
  departmentName: string,
  isdeleted: string,
  departmentId:string
}