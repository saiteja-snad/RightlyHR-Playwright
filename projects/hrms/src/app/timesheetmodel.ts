export interface TimesheetResponse {
  timesheetId: number;
  employeeId: number;
  weekStartDate: string; // ISO string
  weekEndDate: string;   // ISO string
  totalDurationSeconds: number;
  status: string;
  totalDuration: string; // PT0S format
  projects: Project[];
  shiftStartTime:any;
  shiftEndTime:any;
  timesheetdata:any;
}

export interface Project {
  projectId: number;
  projectName: string;
  clientId: number;
  clientName: string;
  days: DayEntry[];
}

export interface DayEntry {
  entryId?: number;        // optional because some days don’t have entryId
  entryDate: string;       // ISO string
  durationSeconds: number;
  isOverride: boolean;
  description?: string;    // optional
  approvalStatus: string;
  isBlocked: boolean;
  blockReason?: string;    // optional
  isleave: boolean;
  clientId: number;
  clientName: string;
  projectId: number;
  projectName: string;
  duration: string;        // PTxHxM format
}




export interface IResourceDetail {
  id: number;
  name: string | null;
  fusionEmpId: string | null;
  workMail: string | null;
  isReportee: boolean ;
  key?: string;
}
