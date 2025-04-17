import { Injectable } from '@angular/core';
import { HttpService } from '../http.service';
import { HttpParams } from '@angular/common/http';
import { IStandardReportRequest } from '../../Interfaces/reports.model';

@Injectable({
  providedIn: 'root',
})
export class ReportsService {
  constructor(private http: HttpService) {}

  getStandardReports(request: IStandardReportRequest) {
    
    const params = new HttpParams();
    if (request.employeeStatus) {
      params.set('EmployeeStatus', request.employeeStatus.toString());
    }

    if (
      request.dateRange &&
      request.dateRange?.startDate &&
      request.dateRange?.endDate
    ) {
      const startDate = this.parseDate(
        request.dateRange?.startDate.format('YYYY-MM-DD')
      );
      const endDate = this.parseDate(
        request.dateRange?.endDate.format('YYYY-MM-DD')
      );
      params.append('DOJStart', this.formatDate(startDate));
      params.append('DOJEnd', this.formatDate(endDate));
    }

    if (
      request.selectedBranchLocation &&
      request.selectedBranchLocation !== 'All Branch Locations'
    ) {
      params.append('BranchCode', request.selectedBranchLocation);
    }
    if (
      request.selectedJobLocation &&
      request.selectedJobLocation != 'All Job Locations'
    ) {
      params.append('JobLocation', request.selectedJobLocation.toString());
    }
    if (
      request.selectedJobSubLocation &&
      request.selectedJobSubLocation != 'All Job Sub Locations'
    ) {
      params.append('SubLocation', request.selectedJobSubLocation.toString());
    }

    const options = {
      params: params,
    };
    return options.params
      ? this.http.get('Reports/standardReportsWithoutPagination', options)
      : this.http.getData('Reports/standardReportsWithoutPagination');
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
}
