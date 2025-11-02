export interface ITimeSheetSummaryResponse {
  [x: string]: never[];
  success: boolean;
  statusCode: number;
  message: string;
  data: TimeSheetSummaryData;
}

// ─────────────────────────────────────────────
// Main Data Structure
// ─────────────────────────────────────────────
export interface TimeSheetSummaryData {
  resource: Resource;
  startDate: string;
  endDate: string;
  dailyData: DailyData[];
  monthlySummary: MonthlySummary;
  graphSummary: GraphSummary;
}

// ─────────────────────────────────────────────
// Resource Information
// ─────────────────────────────────────────────
export interface Resource {
  id: number;
  fusionEmployeeId: string;
  name: string;
}

// ─────────────────────────────────────────────
// Daily Data
// ─────────────────────────────────────────────
export interface DailyData {
  date: string;               // e.g. "2025-10-01"
  entries: Entry[];
  dailySummary: DailySummary;
}

// ─────────────────────────────────────────────
// Timesheet Entry Details
// ─────────────────────────────────────────────
export interface Entry {
  entryId: number;
  projectId: number;
  projectName: string;
  clientId: number;
  clientName: string;
  entryDate: string;          // e.g. "2025-10-27T00:00:00"
  loggedHours: string;        // e.g. "08:00:00"
  status: string;             // e.g. "Processed"
  allocatedHours: number;
  durationSeconds: number;
}

// ─────────────────────────────────────────────
// Daily Summary
// ─────────────────────────────────────────────
export interface DailySummary {
  totalLoggedHours: string;   // "00:00:00"
  status: string;             // "Not Logged" | "Weekend" | "Approved"
  colour: string;             // "#4E4E4E"
  loggedHHMM: string;         // "0:00"
  loggedISO: string;          // "PT0S"
}

// ─────────────────────────────────────────────
// Monthly Summary
// ─────────────────────────────────────────────
export interface MonthlySummary {
  items: MonthlySummaryItem[];
  totalEntries: number;
}

export interface MonthlySummaryItem {
  order: number;
  status: string;             // e.g. "Approved", "Weekend", etc.
  value: number;
  colour: string;
}

// ─────────────────────────────────────────────
// Graph Summary (Charts Section)
// ─────────────────────────────────────────────
export interface GraphSummary {
  timesheetSummary: TimesheetSummary;                 // For Status Pie (Approved / Submitted / Rejected)
  projectWiseSummary: ProjectWiseSummary[];           // For Project Type Pie
  allocatedVsActualSummary: AllocatedVsActualSummary[]; // For Bar Chart
}

// ─────────────────────────────────────────────
// Graph Summary Subtypes
// ─────────────────────────────────────────────
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
