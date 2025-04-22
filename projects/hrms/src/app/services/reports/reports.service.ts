import { Injectable } from '@angular/core';
import { HttpService } from '../http.service';
import { HttpParams } from '@angular/common/http';
import { IAttendanceDetails, ICompoffDetails, ILeavesummery, IStandardReportRequest} from '../../Interfaces/reports.model';

@Injectable({
  providedIn: 'root',
})
export class ReportsService {
  constructor(private http: HttpService) {}

  getStandardReports(request: IStandardReportRequest) {
    let params = new HttpParams();

    if (request.employeeStatus) {
      params = params.set('EmployeeStatus', request.employeeStatus.toString());
    }

    if (request.dateRange?.startDate && request.dateRange?.endDate) {
      params = params.append(
        'DOJStart',
        request.dateRange.startDate.format('YYYY-MM-DD')
      );
      params = params.append(
        'DOJEnd',
        request.dateRange.endDate.format('YYYY-MM-DD')
      );
    }

    if (
      request.selectedBranchLocation &&
      request.selectedBranchLocation !== 'All Branch Locations'
    ) {
      params = params.append('BranchCode', request.selectedBranchLocation);
    }

    if (
      request.selectedJobLocation &&
      request.selectedJobLocation !== 'All Job Locations'
    ) {
      params = params.append(
        'JobLocation',
        request.selectedJobLocation.toString()
      );
    }

    if (
      request.selectedJobSubLocation &&
      request.selectedJobSubLocation !== 'All Job Sub Locations'
    ) {
      params = params.append(
        'SubLocation',
        request.selectedJobSubLocation.toString()
      );
    }

    return this.http.get('Reports/standardReportsWithoutPagination', {
      params,
    });
  }

  getBranchLocations() {
    return this.http.getData('BranchLocation');
  }

  getJobLocations() {
    return this.http.getData('JobLocation');
  }

  getSubLocations(locationName: string, locationList: any[]) {
    let jobSubLocationDetails = locationList.find(
      (c: any) => c.jobLocationName === locationName
    );
    return this.http.getData(
      `JobLocation/sub-location-by-joblocation/${jobSubLocationDetails.id}`
    );
  }

  uploadReportToReportDirectory(employeeId: number, file: File) {
    const filePath = `/FusionDocuments/Employee Documents/Reports/${employeeId}`;
    return this.http.uploadFileWithQuery(
      'FileSystem/uploadfiletodirectory',
      filePath,
      file
    );
  }

  postToReportLog(reportName: string, reportType: string, employeeId: number) {
    const payLoad = {
      generatedBy: employeeId,
      reportsType: reportType,
      reportsName: reportName,
    };
    return this.http.postdata('Reports', payLoad);
  }

  parseDate(date: any): Date {
    return date instanceof Date ? date : new Date(date);
  }
  formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = ('0' + (date.getMonth() + 1)).slice(-2);
    const day = ('0' + date.getDate()).slice(-2);
    return `${year}-${month}-${day}`;
  }
  //attendance report
  getAttendanceReports(request: IAttendanceDetails) {
    let params = new HttpParams();

    if (request.selectedLeaveEmployeeId) {
      params = params.set('FusionEmpId', request.selectedLeaveEmployeeId.toString());
    }

    if (request.selectedDateRange?.startDate && request.selectedDateRange?.endDate) {
      params = params.append(
        'StartDate',
        request.selectedDateRange.startDate.format('YYYY-MM-DD')
      );
      params = params.append(
        'EndDate',
        request.selectedDateRange.endDate.format('YYYY-MM-DD')
      );
    }
    if (request.selectedMonth ) {
      params = params.append('WorkedMonth', request.selectedMonth);
    }

    if (request.selectedLeave ) {
      params = params.append(
        'LeaveName',
        request.selectedLeave.toString()
      );
    }

    if (request.selectedLeaveManager) {
      params = params.append(
        'teamManagerName',
        request.selectedLeaveManager.toString()
      );
    }

    return this.http.get('Reports/Leave_Reports', {
      params,
    });
  }
  //leave summery
  getLeaveSummaryReport(request: ILeavesummery) {
    let params = new HttpParams();

    if (request.selectedEmployeeId) {
      params = params.set('FusionEmpId', request.selectedEmployeeId.toString());
    }

    if (request.selectedLeave ) {
      params = params.append(
        'LeaveType',
        request.selectedLeave.toString()
      );
    }

    if (request.selectedLeaveSummaryManager) {
      params = params.append(
        'Team_Manager',
        request.selectedLeaveSummaryManager.toString()
      );
    }

    return this.http.get('Reports/LeaveSummaryReports', {
      params,
    });
  }
  //comp off
  getcompOffReports(request: ICompoffDetails) {
    let params = new HttpParams();

    if (request.selectedEmployeeId) {
      params = params.set('FusionEmpId', request.selectedEmployeeId.toString());
    }
    if (request.selectedDateRange?.startDate && request.selectedDateRange?.endDate) {
      params = params.append(
        'StartDate',
        request.selectedDateRange.startDate.format('YYYY-MM-DD')
      );
      params = params.append(
        'EndDate',
        request.selectedDateRange.endDate.format('YYYY-MM-DD')
      );
    }
    if (request.selectedMonth ) {
      params = params.append('Worked_Month', request.selectedMonth);
    }

    if (request.selectedCompoffManager) {
      params = params.append(
        'Team_Manager',
        request.selectedCompoffManager.toString()
      );
    }

    return this.http.get('Reports/CompOffReports', {
      params,
    });
  }
}
