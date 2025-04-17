import { Dayjs } from 'dayjs';



export interface IStandardReports {}

export interface IStandardReportRequest {
  employeeStatus?: string;
  dateRange?: { startDate: Dayjs; endDate: Dayjs };
  selectedBranchLocation?: string;
  selectedJobLocation?: string;
  selectedJobSubLocation?: string;
}
