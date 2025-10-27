export interface IWfhAllocationViewModel {
id: number,
employeeId: IEmployeeResponse, 
flexibleAllocation: boolean, 
allowedDays: 10,
createdAt: any
createdBy: IEmployeeResponse
effectiveDate: string
}
export interface IEmployeeResponse{
    id: number, 
    name: string
}