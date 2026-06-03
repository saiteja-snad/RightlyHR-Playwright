import { Component, OnDestroy, OnInit } from '@angular/core';
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

@Component({
  selector: 'app-timesheet-configurations',
  imports: [ReactiveFormsModule, TranslateModule, CommonModule,FormsModule, PaginatorModule, DropdownModule, SelectModule, NgbPopoverModule, MultiSelectModule, DataLoaderContentComponent, NoDataFoundComponent],
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
    this.http.getData(`Project`).pipe(takeUntil(this.destroy$)).subscribe({
      next:(res:any)=>{
        this.projectsoption = res.data;
      },
      error:(err)=>{
        this.projectsoption = [];
        console.log(err); 
      }
    })
  }
  getphases() {
    let selectedProjects =
      this.timesheetconfigForm.get('projects')?.value ? this.timesheetconfigForm.get('projects')?.value:this.selecteddata?.projectId;

    // normalize to array (handles both number and array cases)
    const projectArray = Array.isArray(selectedProjects)
      ? selectedProjects
      : selectedProjects
        ? [selectedProjects]
        : [];

    if (projectArray.length > 0) {
      const projectIds = projectArray.join(',');
      this.http.getData(`ProjectPhases/list?projectId=${projectIds}`).pipe(takeUntil(this.destroy$)).subscribe({
          next: (response: any) => {
            //this.phasesoption = response.data;
          this.phasesoption = response.data.map((phase: any) => ({
            ...phase,
            displayName: `${phase.project?.projectName} - ${phase.phaseName}`
          }));
          }
        });
    } else {
      this.phasesoption = [];

      // reset form safely (works for both forms if needed)
      this.timesheetconfigForm.get('phases')?.reset();
      this.timesheetconfigUpdateForm.get('phases')?.reset();
    }
  }
  intiationalfrom() {
    this.timesheetconfigForm = this.fb.group({
      projects: ['', [Validators.required ]],
      phases: ['', [Validators.required]],
      fields: ['', [Validators.required]],
      isMandatory: [false]
    });
  }

  intiationalupdatefrom() {
    this.timesheetconfigUpdateForm = this.fb.group({
      updateprojects: [{ value: '', disabled: true }, [Validators.required ]],
      updatephases: ['', [Validators.required]],
      updatefields: ['', [Validators.required]],
      isMandatoryupdate: [false]
    });
  }

  openModal(content: any) {
    this.modalService.open(content, { centered: true, backdrop: 'static' });
  }
  posttimesheetconfig(f: FormGroup) {
    if (f.invalid) return;

    const payload = {
      projectIds: f.value.projects,
      isMandatory: f.value.isMandatory,
      phaseIds: f.value.phases,
      fields: f.value.fields
    };

    this.subscription = this.http.postdata("TimesheetConfiguration", payload).pipe(takeUntil(this.destroy$)).subscribe({
      next: (data: any) => {
        this.modalService.dismissAll()
        this.conformationPopup.openSuccessModal("Timesheet Configuration added successfully");
        f.reset();
        this.getTimesheet(this.page, this.pageSize, this.searchQuery);
      },
      error: (reason: any) => {
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
      updateprojects: expenses.projectId,
      updatephases: expenses.phaseId,
      updatefields: expenses.fieldName,
      isMandatoryupdate: expenses.isMandatory
    });
    this.modalService.open(content, { centered: true, backdrop: 'static' });
  }


  onUpdateSubmit() {
    if (this.timesheetconfigUpdateForm.invalid) return;
    const payload = {
      isMandatory: this.timesheetconfigUpdateForm.value.isMandatoryupdate,
      phaseId: this.timesheetconfigUpdateForm.value.updatephases,
      fieldName: this.timesheetconfigUpdateForm.value.updatefields
    };

    this.http.putData(`TimesheetConfiguration/${this.selecteddata.id}`, payload).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res:any) => {
        if (res) {
          this.selecteddata = null
          this.modalService.dismissAll()
          this.getTimesheet(this.page, this.pageSize,this.searchQuery);
          this.conformationPopup.openSuccessModal('Timesheet Configuration updated successfully')
        }
      },
      error: (err:any) => {
        console.error('Update failed', err);
        console.log('Error Body:', err.error);
        this.conformationPopup.openErrorModal(err.error.message?err.error.message:err)
      }
    });
  }
  toggleupdateismandatory(event: any,items?:any){ {
    const isChecked = event.target.checked;
    this.timesheetconfigUpdateForm.patchValue({ isMandatoryupdate: isChecked });
    const payload = {
      isMandatory: isChecked,
      phaseId: items.phaseId,
      fieldName: items.fieldName
    };
    this.http.putData(`TimesheetConfiguration/${items.id}`, payload).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res:any) => {
        if (res) {
          this.selecteddata = null
          this.modalService.dismissAll()
          this.getTimesheet(this.page, this.pageSize,this.searchQuery);
          this.conformationPopup.openSuccessModal('Timesheet Configuration updated successfully')
        }
      },
      error: (err:any) => {
        console.error('Update failed', err);
        console.log('Error Body:', err.error);
        this.conformationPopup.openErrorModal(err.error.message?err.error.message:err)
      }
    });
  }
}
  opendelete(content: any, expenses: any) {
    this.selecteddata = expenses.id
    this.modalService.open(content, { centered: true, backdrop: 'static' });
  }

  deletedata() {
    this.http.deleteData(`TimesheetConfiguration/${this.selecteddata}`).pipe(takeUntil(this.destroy$)).subscribe({
      next: (data: any) => {
        this.modalService.dismissAll()
        this.conformationPopup.openSuccessModal("Timesheet Configuration deleted successfully")
        this.getTimesheet(this.page, this.pageSize,this.searchQuery);
      },
      error: (reason: any) => {
        console.log(reason);

      }
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
  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.complete();
  }
}
