export interface TimesheetSummaryResponse {
  client: Client;
  project: Project;
  resource: Resource;
  startDate: string; // ISO string
  endDate: string; // ISO string
  dailyData: DailyData[];
  monthlySummary: MonthlySummary;
  utilizationSummary: UtilizationSummary;
  resourceName?: string;
  totalLoggedHHMML: any;
}

export interface Client {
  clientId: number;
  clientName: string;
}

export interface Project {
  projectId: number;
  projectName: string;
  clientId: number;
}

export interface Resource {
  id: number;
  fusionEmployeeId: string;
  name: string;
}

export interface DailyData {
  fusionEmployeeId: any;
  date: string; // "2025-10-06"
  entries: TimesheetEntry[]; // one or more entries
  dailySummary: DailySummary;
  monthlySummary: MonthlySummary;
  resourceName?: string;
}

export interface DailyDataV2 {
  fusionEmployeeId?: any;
  date: string; // "2025-10-06"
  entries?: TimesheetEntry; // single entry
  dailySummary: DailySummary;
  monthlySummary?: MonthlySummary;
  resourceName?: string;
}

export interface TimesheetEntry {
  entryId: number;
  projectId: number;
  projectName: string;
  phaseName: string;
  clientId: number;
  clientName: string;
  entryDate: string; // "2025-10-06T00:00:00"
  loggedHours: number;
  status: string;
  loggedHHMM: string;
  summary: string;
  allocatedHours: number;
  finalApproverName?: string;
  approverDesignation?: string;
  clientMeta?: any;
  meta?: any;
  phaseMeta?: any;
  finalApproverId?: any;
}

export interface DailySummary {
  totalLoggedHours: string;
  status: string;
  colour: string;
  loggedISO: string;
  loggedHHMM: string;
  weekday: string;
  holiday: string;
  textColor?: string;
  legendCode?: any;
}

export interface MonthlySummaryItem {
  order: number;
  status: string;
  value: number;
  colour: string;
}

export interface MonthlySummary {
  items: MonthlySummaryItem[];
  totalEntries: number;
}
export interface UtilizationSummary {
  overall: Overall;
  loggedISO: string;
  loggedHHMM: string;
}

export interface Overall {
  loggedHours: number;
  loggedISO: string;
  loggedHHMM: string;
  allocatedHours: number;
}
