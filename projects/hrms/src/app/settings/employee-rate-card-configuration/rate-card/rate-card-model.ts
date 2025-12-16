export interface IRateCardActiveViewModel {
id: number,
entityValue: IEmployeeResponse, 
flexibleAllocation: boolean, 
allowedDays: 10,
createdAt: any
createdBy: IEmployeeResponse
effectiveFromDate: string,
effectiveToDate: string,
isLatest?: boolean,
status?: string,
entityType?:string,
halfDayMinHrs?:string,
fullDayMinHrs?:string
shiftDetails?:any
}
export interface IEmployeeResponse{
    id: number, 
    name: string
}