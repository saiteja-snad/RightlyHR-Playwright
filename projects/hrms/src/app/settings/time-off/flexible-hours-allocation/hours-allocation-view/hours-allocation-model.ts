export interface IHoursAllocationViewModel {
id: number,
employeeId: IEmployeeResponse, 
flexibleAllocation: boolean, 
allowedDays: 10,
createdAt: any
createdBy: IEmployeeResponse
effectiveFromDate: string,
effectiveToDate: string,
isLatest?: boolean,
status?: string
}
export interface IEmployeeResponse{
    id: number, 
    name: string
}