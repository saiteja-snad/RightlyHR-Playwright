import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpEvent, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { BulkUploadResponse } from '../Interfaces/bulk-upload.models';


@Injectable({
  providedIn: 'root'
})
export class BulkUploadService {
  private http = inject(HttpClient);
  private apiUrl = environment.ApiUrl;
  private moduleId = environment.timesheetModuleId;

  executeImportStage(stage: string, employeeId: number, jobId?: number, file?: File, isReupload = false): Observable<any> {
    const formData = new FormData();
    if (jobId) formData.append('JobId', String(jobId));
    formData.append('Stage', stage);
    formData.append('Module', 'Timesheet');
    formData.append('ModuleId', this.moduleId.toString());
    formData.append('PerformedBy', String(employeeId));
    formData.append('IsReupload', String(isReupload));
    if (file) formData.append('File', file);
    return this.http.post(`${this.apiUrl}Import/execute`, formData);
  }

  getImportPreview(jobId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}Import/preview/${jobId}`);
  }

  uploadPreview(file: File, employeeId: number, uploadedByEmployeeId?: number): Observable<HttpEvent<BulkUploadResponse>> {
    const formData = new FormData();
    formData.append('File', file);
    formData.append('EmployeeId', String(employeeId));
    formData.append('UploadedBy', String(uploadedByEmployeeId ?? employeeId));

    return this.http.post<BulkUploadResponse>(
      `${this.apiUrl}timesheet/bulk-upload/preview`,
      formData,
      {
        reportProgress: true,
        observe: 'events'
      }
    );
  }

  confirmUpload(rows: any[], employeeId: number, uploadedByEmployeeId?: number,filePath?:string): Observable<any> {
    const payload = {
      rows,
      employeeId,
      uploadedBy: uploadedByEmployeeId ?? employeeId,
      filePath
    };

    return this.http.post(
      `${this.apiUrl}timesheet/bulk-upload/confirm`,
      payload
    );
  }

  downloadTemplate(moduleId:number,format:string): Observable<HttpResponse<Blob>> {
    return this.http.get(
      `${this.apiUrl}Import/template/download?moduleId=${moduleId}&format=${format}`,
      { responseType: 'blob',observe: 'response'  }
    );

  }

  getResourceData(employeeId: number): Observable<any> {
    return this.http.get(
      `${this.apiUrl}ProjectResource?status=active&employeeId=${employeeId}&isProjectRequired=true`
    );
  }

  getProjectResourceSummary(year: number, employeeId: number): Observable<any> {
    return this.http.get(
      `${this.apiUrl}ProjectResource/resource-summary?year=${year}&employeeId=${employeeId}`
    );
  }

  getDataTransferBatches(employeeIds: number | string, batchIds: number | string, includeRows = true): Observable<any> {
    const employeeIdsParam = encodeURIComponent(String(employeeIds));
    const batchIdsParam = encodeURIComponent(String(batchIds));
    const includeRowsParam = includeRows ? 'true' : 'false';
    return this.http.get(
      `${this.apiUrl}Timesheet/data-transfer/batches?employeeIds=${employeeIdsParam}&batchIds=${batchIdsParam}&includeRows=${includeRowsParam}`
    );
  }
}
