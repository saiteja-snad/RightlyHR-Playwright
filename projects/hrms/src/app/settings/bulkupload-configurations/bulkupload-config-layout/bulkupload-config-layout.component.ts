import { Component, OnDestroy, OnInit } from '@angular/core';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { SettingsHeaderComponent } from '../../../shared/settings-tabs/settings-header/settings-header.component';
import { CommonModule } from '@angular/common';
import { filter, Subject, switchMap, takeUntil } from 'rxjs';
import { DownloadIconComponent } from '../../../icons/download-icon/download-icon.component';
import { BulkUploadService } from '../../../services/bulk-upload.service';
import { BulkUploadStore } from '../bulk-upload/models/bulk-upload.store';
import { HttpService } from '../../../services/http.service';
import { OpenModalService } from '../../../services/open-modal.service';
import { environment } from '../../../../environments/environment';
import { HttpResponse } from '@angular/common/http';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-bulkupload-config-layout',
  imports: [RouterModule, SettingsHeaderComponent, CommonModule, DownloadIconComponent],
  templateUrl: './bulkupload-config-layout.component.html',
  styleUrl: './bulkupload-config-layout.component.scss'
})
export class BulkuploadConfigLayoutComponent implements OnInit, OnDestroy {
  moduleinfo: string = '';
  isDownloadingTemplate = false;
  destroy$ = new Subject<boolean>();

  constructor(
    public readonly router: Router,
    public store: BulkUploadStore,
    private bulkUploadService: BulkUploadService,
    private http: HttpService,
    private conformationPopup: OpenModalService,
    private modalService: NgbModal
  ) { }

  ngOnInit(): void {
    this.router.events
      .pipe(filter((event: any) => event instanceof NavigationEnd))
      .subscribe(() => {
        this.updateModuleInfo();
      });
  }

  updateModuleInfo() {
  }

  downloadTemplate() {
    this.isDownloadingTemplate = true;
    this.bulkUploadService.downloadTemplate(environment.timesheetModuleId, 'csv')
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: HttpResponse<Blob>) => {
          this.isDownloadingTemplate = false;
          let filename = `Timesheet_Import_Template - ${this.http.formattedDate}.csv`;

          const contentDisposition = response?.headers?.get('content-disposition');
          if (contentDisposition) {
            const utf8FilenameMatch = contentDisposition.match(/filename\*\=UTF\-8''([^;]+)/);
            const asciiFilenameMatch = contentDisposition.match(/filename="?([^"]+)"?/);

            if (utf8FilenameMatch && utf8FilenameMatch[1]) {
              filename = decodeURIComponent(utf8FilenameMatch[1]);
            } else if (asciiFilenameMatch && asciiFilenameMatch[1]) {
              filename = asciiFilenameMatch[1];
            }
          }
          const blob = new Blob([response.body!], {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
          });
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = filename;
          link.click();
          window.URL.revokeObjectURL(url);
          console.log('Downloaded file:', filename);
        },
        error: (err) => {
          this.isDownloadingTemplate = false;
          console.error('Failed to download template', err);
          this.conformationPopup.openErrorModal('Failed to download template. Please try again later.');
        }
      });
  }

  onModalFileSelected(event: Event, isReupload = true) {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      this.handleModalFile(input.files[0], isReupload);
      input.value = '';
    }
  }

  private handleModalFile(file: File, isReupload = true) {
    const isValidExtension =
      file.name.endsWith('.xlsx') ||
      file.name.endsWith('.xls') ||
      file.name.endsWith('.csv');

    if (!isValidExtension) {
      this.conformationPopup.openErrorModal('Please upload a valid Excel file (.xlsx or .xls) or .csv file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      this.conformationPopup.openErrorModal('File size must be less than 5MB');
      return;
    }

    this.onFileSelected(file, isReupload);
  }

  onFileSelected(file: File, isReupload = true) {
    const empdata = JSON.parse(localStorage.getItem('rightlyHrUser') || '{}');
    const employeeId = empdata?.employeeId;

    this.store.setLoading(true);
    this.store.setUploadProgress(0);
    this.conformationPopup.openLoaderModal('Uploading...');

    const previousJobId = isReupload ? this.store.jobId() : undefined;

    const start$ = isReupload
      ? this.bulkUploadService.executeImportStage('RE_UPLOAD', employeeId, previousJobId ?? undefined, file, true).pipe(
          switchMap(() => this.bulkUploadService.executeImportStage('UPLOAD', employeeId, undefined, file))
        )
      : this.bulkUploadService.executeImportStage('UPLOAD', employeeId, undefined, file);

    start$
      .pipe(
        switchMap((uploadRes: any) => {
          const jobId = uploadRes?.data?.jobId ?? uploadRes?.jobId;
          if (!jobId) throw new Error('Upload failed: no job ID returned');
          this.store.setJobId(jobId);
          this.store.setCurrentStage('UPLOAD');
          return this.bulkUploadService.executeImportStage('PARSE', employeeId, jobId);
        }),
        switchMap(() => {
          const jobId = this.store.jobId()!;
          this.store.setCurrentStage('PARSE');
          return this.bulkUploadService.executeImportStage('VALIDATE', employeeId, jobId);
        }),
        switchMap(() => {
          const jobId = this.store.jobId()!;
          this.store.setCurrentStage('VALIDATE');
          return this.bulkUploadService.getImportPreview(jobId);
        }),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (previewRes: any) => {
          this.modalService.dismissAll();
          const previewData = previewRes?.data;
          if (previewData) {
            this.store.setResponse({
              success: true,
              statusCode: 200,
              message: 'Preview loaded',
              data: {
                totalRows: previewData.totalRows,
                validRows: previewData.validRows,
                invalidRows: previewData.invalidRows,
                insertCount: previewData.insertCount,
                updateCount: previewData.updateCount,
                skipCount: previewData.skipCount,
                fileName: previewData.fileName,
                filePath: previewData.filePath,
                rows: previewData.rows ?? [],
              }
            } as any);
            localStorage.setItem('timesheetImportStep', '2');
          }
          this.store.setLoading(false);
          this.store.setUploadProgress(0);
        },
        error: (err: any) => {
          this.modalService.dismissAll();
          console.log(err);
          this.conformationPopup.openErrorModal(err?.error.Message || err?.error?.message || 'Failed to process file');
          this.store.setError(err?.error.Message || err?.error?.message || 'Failed to process file');
          this.store.setLoading(false);
          this.store.setUploadProgress(0);
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.complete();
  }
}
