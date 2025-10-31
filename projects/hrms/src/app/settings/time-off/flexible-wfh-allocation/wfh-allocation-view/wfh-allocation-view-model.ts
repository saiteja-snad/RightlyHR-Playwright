export interface IWfhAllocationViewModel {
id: number,
employeeId: IEmployeeResponse, 
flexibleAllocation: boolean, 
allowedDays: 10,
createdAt: any
createdBy: IEmployeeResponse
effectiveFromDate: string,
effectiveToDate: string
isLatest?: boolean
}
export interface IEmployeeResponse{
    id: number, 
    name: string
}