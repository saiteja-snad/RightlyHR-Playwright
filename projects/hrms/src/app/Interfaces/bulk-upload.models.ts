export interface BulkUploadRow {
  rowNumber: number;
  employeeId: string;
  entryDate: string;
  clientName: string;
  projectCode: string;
  projectName: string;
  phaseName: string;
  duration: string;
  description: string;
  billable: string;
  
  // Parsed fields
  parsedEmployeeId?: number;
  parsedClientId?: number;
  parsedProjectId?: number;
  parsedPhaseId?: number;
  parsedBillable?: boolean;
  parsedEntryDate?: string;
  parsedDurationSeconds?: number;
  durationSource?: string;
  
  // Validation flags
  isResourceAssigned: boolean;
  isDateInAssignmentRange: boolean;
  hasExistingEntry: boolean;
  hasOverlap: boolean;
  isValid: boolean;
    projectMeta: {
    graphData: {
      color: string;
      code: string;
    }
  } | null;
  clientMeta: {
    graphData: {
      color: string;
    }
  } | null;
  phaseMeta: {
    graphData: {
      color: string;
    }
  } | null;
  // Action & Status
  action: 'INSERT' | 'UPDATE' | 'SKIP';
  weekStartDate?: string;
  normalizedEntryDate?: string;
  normalizedDuration?: string;
  approverId?: number;
  
  // Errors
  errorCode?: string;
  errorMessage?: string;
  existingEntryStatus?: string;
}

export interface BulkUploadSummary {
  totalRows: number;
  validRows: number;
  invalidRows: number;
  insertCount: number;
  updateCount: number;
  skipCount: number;
  rows: BulkUploadRow[];
  fileName: string;
  filePath?: string;
}

export interface BulkUploadResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: BulkUploadSummary;
}
