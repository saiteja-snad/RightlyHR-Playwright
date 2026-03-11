import { v4 as uuidv4 } from 'uuid';

// Approval Status Enum
export const ApprovalStatus = {
  Draft: 'draft',
  Waiting: 'Waiting for Approval',
  Processed: 'Processed',
  Rejected: 'Rejected',
  NotEntered: 'Not Entered'
} as const;

// Matrix Models
export interface WeekMatrix {
  rows: RowModel[];
  days: DayModel[];
  cellMap: Map<string, CellModel>;
  totals: Map<string, number>;
  metadata: MatrixMetadata;
}

export interface RowModel {
  rowId: string;
  projectId: number;
  projectName: string;
  phaseId: number | null;
  phaseName: string | null;
  clientId: number;
  clientName: string;
  resourceId: number;
  isWeekendAllowedClient: boolean;
  isWeekendAllowedProject: boolean;
  isOverTimeEligibleClient: boolean;
  isOverTimeEligibleProject: boolean;
  isBillableClient: boolean;
  isBillableProject: boolean;
  isNoClientProject: boolean;
}

export interface DayModel {
  date: string;
  dateObj: Date;
  dayKey: string;
  isBlocked: boolean;
  isLeave: boolean;
  blockReason?: string;
}

export interface CellModel {
  entryId?: number;
  entryDate: string;
  durationSeconds: number;
  approvalStatus: string;
  isBlocked: boolean;
  isLeave: boolean;
  blockReason?: string;
  description?: string;
  startTime?: string;
  endTime?: string;
  isBillable: boolean;
  isOverride: boolean;
  approverId?: number;
  rejectReason?: string;
  resourceId?: number;
  isLocked: boolean;
}

export interface MatrixMetadata {
  timesheetId: number;
  employeeId: number;
  weekStartDate: string;
  weekEndDate: string;
  totalDurationSeconds: number;
  status: string;
}

// Transformation Function
export function transformV2ResponseToWeekMatrix(response: any): WeekMatrix {
  const data = response.data;
  
  // 1. Create DayModels (normalize to 7 days)
  const days: DayModel[] = [];
  const dayKeys = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
  
  for (let i = 0; i < 7; i++) {
    const dayData = data.days?.[i];
    const date = dayData?.date || calculateDateForIndex(data.weekStartDate, i);
    const dateObj = new Date(date);
    
    days.push({
      date,
      dateObj,
      dayKey: dayKeys[i],
      isBlocked: dayData?.isBlocked || false,
      isLeave: dayData?.isLeave || false,
      blockReason: dayData?.blockReason
    });
  }

  // 2. Group entries by project/phase/client and date to find unique rows
  const rowSignatures = new Map<string, Set<string>>();
  
  data.days?.forEach((dayData: any) => {
    dayData.entries?.forEach((entry: any) => {
      const projectKey = `${entry.projectId || 0}_${entry.phaseId || 0}_${entry.clientId || 0}`;
      if (!rowSignatures.has(projectKey)) {
        rowSignatures.set(projectKey, new Set());
      }
      rowSignatures.get(projectKey)!.add(dayData.date);
    });
  });

  // 3. Create RowModels and cellMap
  const rows: RowModel[] = [];
  const cellMap = new Map<string, CellModel>();

  if (data.rows && data.rows.length > 0) {
    data.rows.forEach((rowData: any) => {
      const projectKey = `${rowData.projectId || 0}_${rowData.phaseId || 0}_${rowData.clientId || 0}`;
      const datesWithEntries = rowSignatures.get(projectKey);

      if (!datesWithEntries || datesWithEntries.size === 0) {
        // No entries, create one empty row
        const rowId = uuidv4();
        const row: RowModel = {
          rowId,
          projectId: rowData.projectId,
          projectName: rowData.projectName,
          phaseId: rowData.phaseId,
          phaseName: rowData.phaseName,
          clientId: rowData.clientId,
          clientName: rowData.clientName,
          resourceId: rowData.resourceId,
          isWeekendAllowedClient: rowData.isWeekendAllowedClient,
          isWeekendAllowedProject: rowData.isWeekendAllowedProject,
          isOverTimeEligibleClient: rowData.isOverTimeEligibleClient,
          isOverTimeEligibleProject: rowData.isOverTimeEligibleProject,
          isBillableClient: rowData.isBillableClient,
          isBillableProject: rowData.isBillableProject,
          isNoClientProject: rowData.isNoClientProject || false
        };
        rows.push(row);

        days.forEach((day) => {
          const cellKey = `${rowId}_${day.date}`;
          cellMap.set(cellKey, {
            entryDate: day.date,
            durationSeconds: 0,
            approvalStatus: ApprovalStatus.NotEntered,
            isBlocked: day.isBlocked,
            isLeave: day.isLeave,
            blockReason: day.blockReason,
            isBillable: rowData.isBillableProject,
            isOverride: false,
            isLocked: false
          });
        });
      } else {
        // Group entries by date to determine how many rows needed
        const entriesByDate = new Map<string, any[]>();
        
        data.days?.forEach((dayData: any) => {
          const dayEntries = dayData.entries?.filter((e: any) =>
            e.projectId === rowData.projectId &&
            e.phaseId === rowData.phaseId &&
            e.clientId === rowData.clientId
          ) || [];
          
          if (dayEntries.length > 0) {
            entriesByDate.set(dayData.date, dayEntries);
          }
        });

        // Find max entries on any single day
        let maxEntriesPerDay = 0;
        entriesByDate.forEach(entries => {
          maxEntriesPerDay = Math.max(maxEntriesPerDay, entries.length);
        });

        // Create rows equal to max entries on any day
        for (let rowIndex = 0; rowIndex < maxEntriesPerDay; rowIndex++) {
          const rowId = uuidv4();
          const row: RowModel = {
            rowId,
            projectId: rowData.projectId,
            projectName: rowData.projectName,
            phaseId: rowData.phaseId,
            phaseName: rowData.phaseName,
            clientId: rowData.clientId,
            clientName: rowData.clientName,
            resourceId: rowData.resourceId,
            isWeekendAllowedClient: rowData.isWeekendAllowedClient,
            isWeekendAllowedProject: rowData.isWeekendAllowedProject,
            isOverTimeEligibleClient: rowData.isOverTimeEligibleClient,
            isOverTimeEligibleProject: rowData.isOverTimeEligibleProject,
            isBillableClient: rowData.isBillableClient,
            isBillableProject: rowData.isBillableProject,
            isNoClientProject: rowData.isNoClientProject || false
          };
          rows.push(row);

          // Map entries to cells
          days.forEach((day) => {
            const dayEntries = entriesByDate.get(day.date) || [];
            const entry = dayEntries[rowIndex]; // Get entry at this row index

            const cellKey = `${rowId}_${day.date}`;
            
            if (entry) {
              cellMap.set(cellKey, {
                entryId: entry.entryId,
                entryDate: day.date,
                durationSeconds: entry.durationSeconds || 0,
                approvalStatus: entry.approvalStatus || ApprovalStatus.NotEntered,
                isBlocked: entry.isBlocked || day.isBlocked,
                isLeave: entry.isleave || day.isLeave,
                blockReason: entry.blockReason || day.blockReason,
                description: entry.description,
                startTime: entry.startTime,
                endTime: entry.endTime,
                isBillable: entry.isBillable ?? row.isBillableProject,
                isOverride: entry.isOverride || false,
                approverId: entry.approverId,
                rejectReason: entry.rejectReason,
                resourceId: entry.resourceId || row.resourceId,
                isLocked: false
              });
            } else {
              cellMap.set(cellKey, {
                entryDate: day.date,
                durationSeconds: 0,
                approvalStatus: ApprovalStatus.NotEntered,
                isBlocked: day.isBlocked,
                isLeave: day.isLeave,
                blockReason: day.blockReason,
                isBillable: row.isBillableProject,
                isOverride: false,
                isLocked: false
              });
            }
          });
        }
      }
    });
  }

  // 4. Compute totals per day
  const totals = new Map<string, number>();
  days.forEach(day => {
    let total = 0;
    rows.forEach(row => {
      const cell = cellMap.get(`${row.rowId}_${day.date}`);
      if (cell && !cell.isLocked) {
        total += cell.durationSeconds;
      }
    });
    totals.set(day.date, total);
  });

  // 5. Create metadata
  const metadata: MatrixMetadata = {
    timesheetId: data.timesheetId,
    employeeId: data.employeeId,
    weekStartDate: data.weekStartDate,
    weekEndDate: data.weekEndDate,
    totalDurationSeconds: data.totalDurationSeconds,
    status: data.status
  };

  return {
    rows,
    days,
    cellMap,
    totals,
    metadata
  };
}

// Helper: Calculate date for index
function calculateDateForIndex(weekStartDate: string, index: number): string {
  const date = new Date(weekStartDate);
  date.setDate(date.getDate() + index);
  return date.toISOString();
}

// Utility: Check if cell is locked
export function isCellLocked(
  cell: CellModel,
  day: DayModel,
  row: RowModel,
  resourceDateRange?: { startDate: Date | null; endDate: Date | null },
  phaseDateRange?: { startDate: Date | null; endDate: Date | null },
  isFutureDate?: boolean,
  isCurrentEmployee?: boolean,
  isBlocked?: boolean
): boolean {
  // Lock if approved/processed
  if (cell.approvalStatus === ApprovalStatus.Processed || 
      cell.approvalStatus === ApprovalStatus.Waiting) {
    return true;
  }

  // Lock if leave
  if (day.isLeave || cell.isLeave) {
    return true;
  }

  if (isBlocked) {
    return true;
  }
  // Lock if future date
  if (isFutureDate) {
    return true;
  }

  // Lock if not current employee
  if (!isCurrentEmployee) {
    return true;
  }

  // Lock if outside resource date range
  if (resourceDateRange) {
    const cellDate = new Date(cell.entryDate);
    cellDate.setHours(0, 0, 0, 0);
    
    if (resourceDateRange.startDate && cellDate < resourceDateRange.startDate) {
      return true;
    }
    if (resourceDateRange.endDate && cellDate > resourceDateRange.endDate) {
      return true;
    }
  }

  // Lock if outside phase date range
  if (phaseDateRange) {
    const cellDate = new Date(cell.entryDate);
    cellDate.setHours(0, 0, 0, 0);
    
    if (phaseDateRange.startDate && cellDate < phaseDateRange.startDate) {
      return true;
    }
    if (phaseDateRange.endDate && cellDate > phaseDateRange.endDate) {
      return true;
    }
  }

  // Lock if weekend and not allowed
  if (day.isBlocked && day.blockReason === 'Weekend') {
    if (!row.isWeekendAllowedProject && !row.isWeekendAllowedClient) {
      return true;
    }
  }

  return false;
}

// Utility: Recalculate totals
export function recalculateTotals(matrix: WeekMatrix): Map<string, number> {
  const totals = new Map<string, number>();
  
  matrix.days.forEach(day => {
    let total = 0;
    matrix.rows.forEach(row => {
      const cell = matrix.cellMap.get(`${row.rowId}_${day.date}`);
      if (cell && !cell.isLocked) {
        total += cell.durationSeconds;
      }
    });
    totals.set(day.date, total);
  });

  return totals;
}
