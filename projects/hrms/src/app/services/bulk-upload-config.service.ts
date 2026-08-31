import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class BulkUploadConfigService {
  private http = inject(HttpClient);
  private apiUrl = environment.ApiUrl;
  private defaultModuleId = 1001;

  toggleHistoryFilter$ = new Subject<void>();
  filterIndicatorActive$ = new BehaviorSubject<boolean>(false);

  triggerHistoryFilterToggle(): void {
    this.toggleHistoryFilter$.next();
  }

  setFilterIndicatorState(active: boolean): void {
    this.filterIndicatorActive$.next(active);
  }

  executeImportStage(
    stage: string,
    employeeId: number,
    jobId?: number,
    file?: File,
    isReupload = false,
    moduleId?: number,
    moduleName?: string,
    parentJobId?: number
  ): Observable<any> {
    const formData = new FormData();
    if (jobId) formData.append('JobId', String(jobId));
    formData.append('Stage', stage);
    formData.append('Module', moduleName || 'Compensation');
    formData.append('ModuleId', (moduleId ?? this.defaultModuleId).toString());
    formData.append('PerformedBy', String(employeeId));
    formData.append('IsReupload', String(isReupload));
    if (parentJobId && (stage === 'UPLOAD' || stage === 'RE_UPLOAD')) {
      formData.append('ParentJobId', String(parentJobId));
    }
    if (file) formData.append('File', file);
    return this.http.post(`${this.apiUrl}Import/execute`, formData);
  }

  getImportPreview(jobId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}Import/preview/${jobId}`);
  }

  downloadTemplate(moduleId: number, format: string): Observable<HttpResponse<Blob>> {
    return this.http.get(
      `${this.apiUrl}Import/template/download?moduleId=${moduleId}&format=${format}`,
      { responseType: 'blob', observe: 'response' }
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
