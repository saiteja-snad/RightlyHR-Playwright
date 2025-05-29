import { Injectable } from '@angular/core';
import { HttpService } from '../http.service';
import { HttpParams } from '@angular/common/http';
import { IAbsentReportRequest, IAttendanceDetails, ICompoffDetails, IInactiveReportRequest, ILeavesummery, IPermissionReportRequest, IStandardReportRequest, IWfhReportRequest, IYearlyReportRequest} from '../../Interfaces/reports.model';

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
      request.selectedBranchLocation !== 'All'
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

  getWfhReports(request: IWfhReportRequest) {
    let params = new HttpParams();
  
    if (request.employeeId) { params = params.set('EmployeeId', request.employeeId);}
    if (request.teamManagerID)params =params.set('teamManagerID',request.teamManagerID);
    // if (request.TeamManagerSnadId) {params = params.set('TeamManagerFusionEmpId', request.TeamManagerSnadId); }
    if (request.StartDate && request.EndDate) {
      params = params.set('StartDate', request.StartDate);
      params = params.set('EndDate', request.EndDate);
    }
  
    return this.http.get('Reports/WfhReports', { params });
  }


  getInactiveReports(request: IInactiveReportRequest) {
    let params = new HttpParams();
  
    if (request.employeeId) {
      params = params.set('EmployeeId', request.employeeId);
    }

    if (request.teamManagerID) {
      params = params.set('teamManagerID', request.teamManagerID);
    }
  
    if(request.LeaveName) {
      params = params.set('LeaveName', request.LeaveName);
    }

   if(request.Year) {
      params = params.set('Year', request.Year);
    }
    return this.http.get('Reports/Inactive_Employee_Reports', { params });
  }


  getAbsentReports(request: IAbsentReportRequest) {
    let params = new HttpParams();
  
    // Check and append each property from the request to the HttpParams
    if (request.FusionEmpId) {
      params = params.set('FusionEmpId', request.FusionEmpId.toString());
    }
  
    if (request.TeamManagerSnadId) {
      params = params.set('TeamManagerFusionEmpId', request.TeamManagerSnadId);
    }
  
    if (request.Worked_Date) {
      params = params.set('Worked_Date', request.Worked_Date);
    }
  
    if (request.StartDate && request.EndDate) {
      params = params.set('StartDate', request.StartDate);
      params = params.set('EndDate', request.EndDate);
    }
  
    if (request.Worked_Month !== undefined) {
      params = params.set('Worked_Month', request.Worked_Month.toString());
    }
  
    return this.http.get('Reports/AbsentReports', { params });
  }
  
  getYearlyReports(request: IYearlyReportRequest) {
    let params = new HttpParams();
    
    if (request.employeeId) params = params.set('EmployeeId', request.employeeId);
    if (request.teamManagerID) params = params.set('teamManagerID', request.teamManagerID);
    if (request.EntitlementYear) params = params.set('EntitlementYear', request.EntitlementYear);
    if (request.LeaveName) params = params.set('LeaveName', request.LeaveName);
  
    return this.http.get('Reports/YearSummaryReports', { params });
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
    // if (request.FusionEmpId) params = params.set('FusionEmpId', request.FusionEmpId);
    if (request.employeeId) params = params.set('EmployeeId', request.employeeId);
    if (request.teamManagerID)params =params.set('teamManagerID',request.teamManagerID);
    if (request.TeamManagerSnadId) params = params.set('TeamManagerFusionEmpId', request.TeamManagerSnadId);
    if (request.LeaveName) params = params.set('LeaveName', request.LeaveName);
    if (request.StartDate && request.EndDate) {params = params.set('StartDate', request.StartDate);
    params = params.set('EndDate', request.EndDate);
    }
  
    if (request.Worked_Month !== undefined) {
      params = params.set('Worked_Month', request.Worked_Month.toString());
    }

    return this.http.get('Reports/Leave_Reports', { params });
  }

  getLeaveSummaryReport(request: ILeavesummery) {
    let params = new HttpParams();
    
    if (request.EmployeeId) params = params.set('EmployeeId', request.EmployeeId);
    if (request.teamManagerID) params = params.set('teamManagerID', request.teamManagerID);
    if (request.LeaveName) params = params.set('LeaveType', request.LeaveName);
    return this.http.get('Reports/LeaveSummaryReports', { params });
  }
  
  //comp off
  getcompOffReports(request: ICompoffDetails) {
    let params = new HttpParams();
  
    if (request.employeeId) {
      params = params.set('EmployeeId', request.employeeId.toString());
    }
  
    if (request.teamManagerID) {
      params = params.set('teamManagerID', request.teamManagerID);
    }
  
    if (request.StartDate && request.EndDate) {
      params = params.set('StartDate', request.StartDate);
      params = params.set('EndDate', request.EndDate);
    }

    return this.http.get('Reports/CompOffReports', { params });
  }

  gterPermissionReports(request: IPermissionReportRequest) {
    let params = new HttpParams();

    if (request.employeeId) params = params.set('employeeId', request.employeeId);
    if (request.EmployeeName) params = params.set('EmployeeName', request.EmployeeName);
    if (request.teamManagerId) params = params.set('teamManagerId', request.teamManagerId);
    if (request.StartDate && request.EndDate) { params = params.set('StartDate', request.StartDate);
       params = params.set('EndDate', request.EndDate);
    }

    return this.http.get('Reports/PermissionReports', { params });
  }

  getRegularizationReports(request: IPermissionReportRequest) {
    let params = new HttpParams();

    if (request.employeeId) params = params.set('employeeId', request.employeeId);
    if (request.EmployeeName) params = params.set('EmployeeName', request.EmployeeName);
    if (request.teamManagerId) params = params.set('teamManagerId', request.teamManagerId);
    if (request.StartDate && request.EndDate) {
      params = params.set('StartDate', request.StartDate);
      params = params.set('EndDate', request.EndDate);
    }

    return this.http.get('Reports/AttendanceRegularizationReports', { params });
  }
  
  
}
