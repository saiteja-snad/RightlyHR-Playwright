import { Injectable, signal, computed } from '@angular/core';
import { BulkUploadResponse } from '../../../../Interfaces/bulk-upload.models';

export type FilterType = 'ALL' | 'VALID' | 'INVALID' | 'INSERT' | 'UPDATE' | 'SKIP';

const JOB_ID_KEY = 'bulkImportJobId';
const STAGE_KEY = 'bulkImportStage';
const SUBMISSION_JOB_ID_KEY = 'bulkImportSubmissionJobId';
const PARENT_JOB_ID_KEY = 'bulkImportParentJobId';

@Injectable({
  providedIn: 'root'
})
export class BulkUploadStore {
  readonly loading = signal<boolean>(false);
  readonly uploadProgress = signal<number>(0);
  readonly error = signal<string | null>(null);
  readonly response = signal<BulkUploadResponse | null>(null);
  readonly activeFilter = signal<FilterType>('ALL');
  readonly jobId = signal<number | null>(+localStorage.getItem(JOB_ID_KEY)! || null);
  readonly currentStage = signal<string>(localStorage.getItem(STAGE_KEY) || '');
  readonly submissionJobId = signal<number | null>(+localStorage.getItem(SUBMISSION_JOB_ID_KEY)! || null);
  readonly parentJobId = signal<number | null>(+localStorage.getItem(PARENT_JOB_ID_KEY)! || null);

  readonly summary = computed(() => this.response()?.data);
  readonly allRows = computed(() => this.response()?.data.rows ?? []);
  readonly fileName = computed(() => this.response()?.data.fileName);
  readonly columns = computed(() => this.response()?.data?.columns ?? []);
  readonly validRows = computed(() => this.allRows().filter(r => r.isValid));

  readonly stats = computed(() => {
    const rows = this.allRows();
    let valid = 0, invalid = 0;
    for (const r of rows) { r.isValid ? valid++ : invalid++; }
    return { total: rows.length, valid, invalid };
  });

  readonly invalidRows = computed(() => this.allRows().filter(r => !r.isValid));
  readonly totalCount = computed(() => this.allRows().length);
  readonly validCount = computed(() => this.validRows().length);
  readonly invalidCount = computed(() => this.invalidRows().length);

  readonly filteredRows = computed(() => {
    const rows = this.allRows();
    const filter = this.activeFilter();
    switch (filter) {
      case 'VALID': return rows.filter(r => r.isValid);
      case 'INVALID': return rows.filter(r => !r.isValid);
      case 'INSERT': return rows.filter(r => r.action === 'INSERT');
      case 'UPDATE': return rows.filter(r => r.action === 'UPDATE');
      case 'SKIP': return rows.filter(r => r.action === 'SKIP');
      default: return rows;
    }
  });

  setLoading(isLoading: boolean) { this.loading.set(isLoading); }
  setUploadProgress(progress: number) { this.uploadProgress.set(progress); }
  setError(error: string | null) { this.error.set(error); }

  setResponse(response: BulkUploadResponse) {
    this.response.set(response);
    this.error.set(null);
  }

  setFilter(filter: FilterType) { this.activeFilter.set(filter); }

  setJobId(id: number | null) {
    this.jobId.set(id);
    if (id != null) localStorage.setItem(JOB_ID_KEY, String(id));
    else localStorage.removeItem(JOB_ID_KEY);
  }

  setCurrentStage(stage: string) {
    this.currentStage.set(stage);
    if (stage) localStorage.setItem(STAGE_KEY, stage);
    else localStorage.removeItem(STAGE_KEY);
  }

  setSubmissionJobId(id: number | null) {
    this.submissionJobId.set(id);
    if (id != null) localStorage.setItem(SUBMISSION_JOB_ID_KEY, String(id));
    else localStorage.removeItem(SUBMISSION_JOB_ID_KEY);
  }

  setParentJobId(id: number | null) {
    this.parentJobId.set(id);
    if (id != null) localStorage.setItem(PARENT_JOB_ID_KEY, String(id));
    else localStorage.removeItem(PARENT_JOB_ID_KEY);
  }

  reset() {
    this.response.set(null);
    this.error.set(null);
    this.loading.set(false);
    this.uploadProgress.set(0);
    this.activeFilter.set('ALL');
    this.setJobId(null);
    this.setCurrentStage('');
    this.setSubmissionJobId(null);
    this.setParentJobId(null);
  }
}
