export interface ITimeSheetSummaryResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: TimeSheetSummaryData;
}

export interface TimeSheetSummaryData {
  resource: Resource;
  startDate: string; // "2025-10-01T00:00:00"
  endDate: string;   // "2025-10-30T00:00:00"
  dailyData: DailyData[];
  monthlySummary: MonthlySummary;
  graphSummary: GraphSummary;
}

export interface Resource {
  id: number;
  fusionEmployeeId: string;
  name: string;
}

export interface DailyData {
  date: string; // "2025-10-01"
  entries: Entry[];
  dailySummary: DailySummary;
}

export interface Entry {
  entryId: number;
  projectId: number;
  projectName: string;
  clientId: number;
  clientName: string;
  entryDate: string; // "2025-10-27T00:00:00"
  loggedHours: string; // "08:00:00"
  status: string; // "Processed"
  allocatedHours: number;
  durationSeconds: number;
}

export interface DailySummary {
  totalLoggedHours: string; // "00:00:00"
  status: string; // "Not Logged" | "Weekend" | "Approved"
  colour: string; // "#4E4E4E"
  loggedHHMM: string; // "0:00"
  loggedISO: string; // "PT0S"
}

export interface MonthlySummary {
  items: MonthlySummaryItem[];
  totalEntries: number;
}

export interface MonthlySummaryItem {
  order: number;
  status: string; // "Approved" | "Weekend" | etc.
  value: number;
  colour: string;
}

export interface GraphSummary {
  timesheetSummary: TimesheetSummary;
  projectWiseSummary: ProjectWiseSummary[];
  allocatedVsActualSummary: AllocatedVsActualSummary[];
}

export interface TimesheetSummary {
  approved: number;
  submitted: number;
  rejected: number;
}

export interface ProjectWiseSummary {
  projectName: string;
  hours: number;
}

export interface AllocatedVsActualSummary {
  projectName: string;
  estimatedHours: number;
  actualHours: number;
  overDue: number;
}
