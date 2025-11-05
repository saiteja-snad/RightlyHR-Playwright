export interface ITimeTrackingResponse {
  success: boolean;
  statusCode: number;
  message: string;
  pagination: Pagination;
  data: TimeTrackingData[];
}

export interface Pagination {
  currentPage: number;
  pageSize: number;
  totalRecords: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface TimeTrackingData {
  employee: Employee;
  clients: Client[]; 
  dailyData: DailyData[];
}

export interface Employee {
  id: number;
  fusionEmployeeId: string;
  name: string;
}

export interface Client {
  // Define client fields when available
  [key: string]: any;
}

export interface DailyData {
  date: string; // e.g., "2025-10-01"
  entries: Entry[]; // Empty in your data, but type kept for flexibility
  dailySummary: DailySummary;
}

export interface Entry {
  // Define fields once actual entry structure is known
  [key: string]: any;
}

export interface DailySummary {
  totalLoggedHours: string; // "00:00:00"
  status: string; // "Not Logged" | "Weekend" | etc.
  colour: string; // "#4E4E4E"
  loggedHHMM: string; // "0:00"
  loggedISO: string; // "PT0S"
}
