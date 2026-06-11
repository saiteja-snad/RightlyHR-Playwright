import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbModal, NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import moment from 'moment';
import { Subject, Subscription, takeUntil } from 'rxjs';
import { FormValidationService } from '../../../../../../../preonboarding/src/app/common-services/form-validation.service';
import { HttpService } from '../../../../services/http.service';
import { OpenModalService } from '../../../../services/open-modal.service';
import { RbacService } from '../../../../services/rbac.service';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { SelectModule } from 'primeng/select';
import { MultiSelectModule } from 'primeng/multiselect';
import { DataLoaderContentComponent } from "../../../../shared/data-loader-content/data-loader-content.component";
import { NoDataFoundComponent } from "../../../../shared/no-data-found/no-data-found.component";
import { DropdownModule } from 'primeng/dropdown';
import { PaginatorModule } from 'primeng/paginator';
import { DateformatPipe } from "../../../../pipes/dateformat.pipe";

@Component({
  selector: 'app-timesheet-configurations',
  imports: [ReactiveFormsModule, TranslateModule, CommonModule, FormsModule, PaginatorModule, DropdownModule, SelectModule, NgbPopoverModule, MultiSelectModule, DataLoaderContentComponent, NoDataFoundComponent, DateformatPipe],
  templateUrl: './timesheet-configurations.component.html',
  styleUrl: './timesheet-configurations.component.scss'
})
export class TimesheetConfigurationsComponent implements OnInit, OnDestroy {
timesheetconfigForm!: FormGroup;
  timesheetconfigUpdateForm!: FormGroup;
  empinfo = {} as any;
  destroy$: Subject<boolean> = new Subject<boolean>();
  timesheetconfigdata: any[] = [];
  dataload = false;
  selecteddata: any;
  subscription!: Subscription;
  fieldsoptions = [
    { label: 'Task Type', value: 'Task Type' },
    { label: 'Description', value: 'Description' },
    { label: 'Start Time', value: 'Start Time' },
    { label: 'End Time', value: 'End Time' },
  ];
    private prevFields: string[] = [];

  onFieldsChange(selected: string[], controlName: string = 'fields') {
    if (!selected) return;
    const prev = this.prevFields;
    const justAdded = selected.find(v => !prev.includes(v));
    const justRemoved = prev.find(v => !selected.includes(v));
    let updated = [...selected];

    if (justAdded === 'Start Time') updated = [...updated.filter(v => v !== 'End Time'), 'End Time'];
    else if (justAdded === 'End Time') updated = [...updated.filter(v => v !== 'Start Time'), 'Start Time'];
    else if (justRemoved === 'Start Time') updated = updated.filter(v => v !== 'End Time');
    else if (justRemoved === 'End Time') updated = updated.filter(v => v !== 'Start Time');

    this.prevFields = updated;
    this.timesheetconfigForm.get(controlName)?.setValue(updated, { emitEvent: false });
  }
  projectsoption = [] as any;
  phasesoption = [] as any;
  page = 1;
  pageSize = 50;
  rows = 50;
  collectionSize!: number;
  first = 0;
  totalRecords = 0;
  searchQuery = '';
  options = [
    { label: 50, value: 50 },
    { label: 100, value: 100 },
    { label: 150, value: 150 },
    { label: 200, value: 200 }
  ];
  requiredValidator = Validators.required;
   responseSummary = {
    failedreason: '',
    successRecordsCount: 0,
    failureRecordsCount: 0,
    totalRecordsCount: 0
  };
   @ViewChild('releaseSummary') releaseSummaryModal!: any;
    loading = false;
  constructor(
    public router: Router,
    private modalService: NgbModal,
    private fb: FormBuilder,
    private conformationPopup: OpenModalService,
    private http: HttpService,
    public formValidation: FormValidationService,
    public rbac: RbacService,
  ) { }

  ngOnInit(): void {
    this.empinfo = JSON.parse(localStorage.getItem('rightlyHrUser') ?? '{}');
    this.intiationalfrom();
    this.intiationalupdatefrom();
    this.getTimesheet(this.page, this.pageSize,this.searchQuery);
    this.getprojects();
  }
  getprojects(){
    this.http.getData(`Project?status=active`).pipe(takeUntil(this.destroy$)).subscribe({
      next:(res:any)=>{
        this.projectsoption = res.data;
        this.projectsoption.unshift({
          projectId: 0,
          phaseId:0,
          projectName: 'No Client - No Project'
        });
      },
      error:(err)=>{
        this.projectsoption = [];
        console.log(err); 
      }
    })
  }
  getphases() {
    let selectedProjects =
      this.timesheetconfigForm.get('projects')?.value
        ? this.timesheetconfigForm.get('projects')?.value
        : this.selecteddata?.projectId;

    const projectArray = Array.isArray(selectedProjects)
      ? selectedProjects
      : selectedProjects
        ? [selectedProjects]
        : [];

    // Only No Client - No Project selected
    if ((projectArray.length === 1) && projectArray.includes(0)) {
      this.phasesoption = [
        {
          phaseId: 0,
          displayName: 'No Phase'
        }
      ];

      this.timesheetconfigForm.get('phases')?.setValue([0]);
       this.timesheetconfigUpdateForm.get('updatephases')?.setValue(0);

      this.timesheetconfigForm.get('phases')?.disable();
      this.timesheetconfigUpdateForm.get('updatephases')?.disable();

      return;
    }
    const validProjectIds = projectArray.filter(
      id => id !== null && id !== undefined && id !== '' && id !== 0
    );

    if (validProjectIds.length > 0) {
      const params: any = {
        projectId: validProjectIds.join(','),
        status: 'yet to start,in progress,extended'
      };

      this.http
        .getDataIncludeParams('ProjectPhases/list', params)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response: any) => {
            this.phasesoption = response.data.map((phase: any) => ({
              ...phase,
              displayName: `${phase.project?.projectName} - ${phase.phaseName}`
            }));

            // Add No Phase only if "No Client - No Project" is still selected
            if (projectArray.includes(0)) {
              this.phasesoption.unshift({
                phaseId: 0,
                phaseName: 'No Phase',
                displayName: 'No Phase'
              });
            }

            const formControls = [
              this.timesheetconfigForm.get('phases'),
              this.timesheetconfigUpdateForm.get('updatephases')
            ];

            formControls.forEach(control => {
              control?.enable();
              control?.setValidators([Validators.required]);
              const currentValue = control?.value;
              if (Array.isArray(currentValue)) {
                const filteredValue = currentValue.filter((id: any) => 
                  this.phasesoption.some((phase: any) => phase.phaseId === id)
                );
                control?.setValue(filteredValue.length > 0 ? filteredValue : [], { emitEvent: false });
              } else {
                control?.setValue(currentValue || [0], { emitEvent: false });
              }
              control?.updateValueAndValidity();
            });
          },
          error: () => {
            this.phasesoption = [];
          }
        });
    } else {
     this.phasesoption = [];
      this.phasesoption.unshift({
              phaseId: 0,
              phaseName: 'No Phase',
              displayName: 'No Phase'
            });
      this.timesheetconfigForm.get('phases')?.setValue([]);
      this.timesheetconfigUpdateForm.get('updatephases')?.setValue(0);

      this.timesheetconfigForm.get('phases')?.disable();
      this.timesheetconfigUpdateForm.get('updatephases')?.disable();
    }
  }
  intiationalfrom() {
    this.timesheetconfigForm = this.fb.group({
      projects: ['', [Validators.required ]],
      phases: ['', [Validators.required]],
      fields: ['', [Validators.required]],
      isMandatory: [false],
      effectivefrom: ['', [Validators.required]]
    });
  }

  intiationalupdatefrom() {
    this.timesheetconfigUpdateForm = this.fb.group({
      updateprojects: [{ value: '', disabled: true }, [Validators.required ]],
      updatephases: ['', [Validators.required]],
      updatefields: ['', [Validators.required]],
      isMandatoryupdate: [false],
      updateeffectivefrom:['', [Validators.required]]
    });
  }

  openModal(content: any) {
  this.phasesoption = [];
  this.timesheetconfigForm.reset();
  this.timesheetconfigForm.patchValue({
    effectivefrom: moment().format('YYYY-MM-DD'),
    isMandatory: false
    });
    this.modalService.open(content, { centered: true, backdrop: 'static' });
  }
  posttimesheetconfig(f: FormGroup) {
    this.loading = true;
    if (f.invalid) return;
    const formvalue= this.timesheetconfigForm.getRawValue();
    const payload = {
      projectIds: (formvalue.projects || []).filter((id: any) => id !== null && id !== undefined),
      isMandatory: formvalue.isMandatory?formvalue.isMandatory:false,
      phaseIds: formvalue.phases||[0],
      fields: formvalue.fields,
      effectiveDate: formvalue.effectivefrom? moment(formvalue.effectivefrom).format('YYYY-MM-DD'):null
    };
    this.subscription = this.http.postdata("TimesheetConfiguration", payload).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res: any) => {
        this.loading=false;
        // this.modalService.dismissAll()
        // this.conformationPopup.openSuccessModal("Timesheet Configuration added successfully");
        const successCount = res?.data?.successCount;
        const failureCount = res.data.failedCount;
        this.responseSummary = {
          failedreason:Array.isArray(res?.data?.failed) && res.data.failed.length > 0? res.data.failed: 'NA',
          successRecordsCount: successCount,
          failureRecordsCount: failureCount,
          totalRecordsCount: res?.data?.totalCount,
        };
        console.log(this.responseSummary);
        this.modalService.dismissAll();
        const modalRef = this.modalService.open(this.releaseSummaryModal, {
          centered: true,
          size: 'lg',
        });
        setTimeout(() => {
          modalRef.close();
        }, 3000);

        f.reset();
        this.getTimesheet(this.page, this.pageSize, this.searchQuery);
      },
      error: (reason: any) => {
        this.loading=false;
        this.conformationPopup.openErrorModal(reason.error.message);
      },
    });
  }

  getTimesheet(page?: number, pageSize?: number,searchQuery?:string) {
    this.dataload = true
    let url = `TimesheetConfiguration?pageNumber=${page}&pageSize=${pageSize}`;
    if (searchQuery) {
      url += `&search=${searchQuery}`;
    }
    this.http.getData(url).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res: any) => {
        this.timesheetconfigdata = res?.items as any[];
        this.collectionSize = res?.totalCount || 0;
        this.dataload = false
      },
      error: () => {
        this.timesheetconfigdata=[];
        this.dataload = false
      },
      complete: () => {
        this.dataload = false
      },
    })
  }


  openupdate(content: any, expenses: any): void {
    console.log(expenses)
    this.selecteddata = expenses;
    this.getphases();
    this.timesheetconfigUpdateForm.patchValue({
      updateprojects: expenses.projectId||0,
      updatephases: expenses.phaseId||0,
      updatefields: expenses.fieldName,
      isMandatoryupdate: expenses.isMandatory,
      updateeffectivefrom: expenses.effectiveDate? moment(expenses.effectiveDate).format('YYYY-MM-DD'):null
    });
    this.modalService.open(content, { centered: true, backdrop: 'static' });
  }


  onUpdateSubmit() {
    this.loading = true;
    if (this.timesheetconfigUpdateForm.invalid) return;
    const payload = {
      isMandatory: this.timesheetconfigUpdateForm.value.isMandatoryupdate,
      phaseId: this.timesheetconfigUpdateForm.value.updatephases,
      fieldName: this.timesheetconfigUpdateForm.value.updatefields,
      effectiveDate: this.timesheetconfigUpdateForm.value.updateeffectivefrom? moment(this.timesheetconfigUpdateForm.value.updateeffectivefrom).format('YYYY-MM-DD'):null
    };

    this.http.putData(`TimesheetConfiguration/${this.selecteddata.id}`, payload).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res:any) => {
        if (res) {
          this.loading=false;
          this.selecteddata = null
          this.modalService.dismissAll()
          this.getTimesheet(this.page, this.pageSize,this.searchQuery);
          this.conformationPopup.openSuccessModal('Timesheet Configurations updated successfully')
        }
      },
      error: (err:any) => {
        this.loading=false;
        console.log('Error Body:', err.error);
        this.conformationPopup.openErrorModal(err.error.message?err.error.message:err)
      }
    });
  }
 toggleupdateismandatory(event: any, items?: any) {
    const isChecked = event.target.checked;
    this.timesheetconfigUpdateForm.patchValue({ isMandatoryupdate: isChecked });

    // Find paired record: if Start Time, find End Time and vice versa
    const pairedField = items.fieldName === 'Start Time' ? 'End Time' : items.fieldName === 'End Time' ? 'Start Time' : null;
    const pairedRecord = pairedField
      ? this.timesheetconfigdata.find(d => d.fieldName === pairedField && d.phaseId === items.phaseId)
      : null;

    const updateRecord = (id: number, fieldName: string) => {
      const payload = { isMandatory: isChecked, phaseId: items.phaseId, fieldName, effectiveDate: items.effectiveDate };
      return this.http.putData(`TimesheetConfiguration/${id}`, payload).pipe(takeUntil(this.destroy$));
    };

    updateRecord(items.id, items.fieldName).subscribe({
      next: () => {
        if (pairedRecord) {
          updateRecord(pairedRecord.id, pairedRecord.fieldName).subscribe({
            next: () => {
              this.getTimesheet(this.page, this.pageSize, this.searchQuery);
              this.conformationPopup.openSuccessModal('Timesheet Configurations updated successfully');
            },
            error: (err: any) => this.conformationPopup.openErrorModal(err.error?.message ?? err)
          });
        } else {
          this.getTimesheet(this.page, this.pageSize, this.searchQuery);
          this.conformationPopup.openSuccessModal('Timesheet Configurations updated successfully');
        }
      },
      error: (err: any) => this.conformationPopup.openErrorModal(err.error?.message ?? err)
    });
  }
  opendelete(content: any, expenses: any) {
    this.selecteddata = expenses;
    this.modalService.open(content, { centered: true, backdrop: 'static' });
  }

  deletedata() {
    const item = this.selecteddata;
    const pairedField = item.fieldName === 'Start Time' ? 'End Time' : item.fieldName === 'End Time' ? 'Start Time' : null;
    const pairedRecord = pairedField
      ? this.timesheetconfigdata.find(d => d.fieldName === pairedField && d.phaseId === item.phaseId)
      : null;

    this.http.deleteData(`TimesheetConfiguration/${item.id}`).pipe(takeUntil(this.destroy$)).subscribe({
      next: () => {
        if (pairedRecord) {
          this.http.deleteData(`TimesheetConfiguration/${pairedRecord.id}`).pipe(takeUntil(this.destroy$)).subscribe({
            next: () => {
              this.modalService.dismissAll();
              this.conformationPopup.openSuccessModal('Timesheet Configuration deleted successfully');
              this.getTimesheet(this.page, this.pageSize, this.searchQuery);
            },
            error: (err: any) => console.log(err)
          });
        } else {
          this.modalService.dismissAll();
          this.conformationPopup.openSuccessModal('Timesheet Configuration deleted successfully');
          this.getTimesheet(this.page, this.pageSize, this.searchQuery);
        }
      },
      error: (reason: any) => console.log(reason)
    });
  }
   onRowsChange() {
    this.page = 1;
    this.first = 0;
    this.getTimesheet(this.page, this.pageSize,this.searchQuery);
  }

  onPageChange(event: any) {
    this.page = event.page + 1;
    this.pageSize = event.rows;
    this.first = event.first;
   this.getTimesheet(this.page, this.pageSize,this.searchQuery);
  }

  // Called when first size changes
  onPageSizeChange(newPageSize: number) {
    this.pageSize = newPageSize;
    this.rows = newPageSize;
    this.page = 1;
    this.first = 0;
    this.getTimesheet(this.page, this.pageSize,this.searchQuery);
  }
  resetForm() {
  this.timesheetconfigForm.reset();

  this.timesheetconfigForm.patchValue({
    effectivefrom: moment().format('YYYY-MM-DD'),
    isMandatory: false
  });
}
  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.complete();
  }
}
