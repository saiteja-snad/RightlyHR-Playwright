export interface IAttendance{
   employeeId: number,
    date: Date,
      firstLogin: Date,
      lastLogout: Date,
      duration: any,
      status: string,
      subStatus?: [],
      tags: [],
      dayLogs:IdayLogs[],
}
export interface IdayLogs{
    direction:string;
    punchTime:any
}