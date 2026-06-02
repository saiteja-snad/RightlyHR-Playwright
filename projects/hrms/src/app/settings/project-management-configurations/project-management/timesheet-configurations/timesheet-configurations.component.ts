import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
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

@Component({
  selector: 'app-timesheet-configurations',
  imports: [ReactiveFormsModule, TranslateModule, CommonModule,SelectModule,NgbPopoverModule,MultiSelectModule],
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
  selectedExpensesId: any;
  subscription!: Subscription;
  fieldsoptions = [
    { label: 'Task Type', value: 'task_type' },
    { label: 'Description', value: 'description' },
    { label: 'Start Time', value: 'start_time' },
    { label: 'End Time', value: 'end_time' },
  ];
  projectsoption = [] as any;
  phasesoption = [] as any;
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
    this.getTimesheet();
    this.getprojects();
  }
  getprojects(){
    this.subscription=this.http.getData(`Project`).subscribe({
      next:(res:any)=>{
        console.log(res);
        this.projectsoption = res.data;
        
      },
      error:(err)=>{
        this.projectsoption = [];
        console.log(err); 
      }
    })
  }
  getphases() {
    const selectedProjects = this.timesheetconfigForm.get('projects')?.value;
    console.log(selectedProjects);
    if (selectedProjects && selectedProjects.length > 0) {
      const projectIds = selectedProjects.join(',');

      this.subscription = this.http
        .getData(`ProjectPhases/list?projectId=${projectIds}`)
        .subscribe({
          next: (response:any) => {
            this.phasesoption = response.data;
          }
        });
    } else {
      this.phasesoption = []; // Clear phases data
      this.timesheetconfigForm.get('phases')?.setValue(null); // Optional: reset selected phase
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
      updateprojects: ['', [Validators.required ]],
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
      projectId: f.value.projects?.join(','),
      isMandatory: f.value.isMandatory,
      phaseIds: f.value.phases,
      fields: f.value.fields
    };

    this.subscription = this.http.postdata("TimesheetConfiguration", payload).pipe(takeUntil(this.destroy$)).subscribe({
      next: (data: any) => {
        this.modalService.dismissAll()
        this.conformationPopup.openSuccessModal("Timesheet Configuration added successfully");
        f.reset();
        this.getTimesheet();
      },
      error: (reason: any) => {
        this.conformationPopup.openErrorModal(reason.error.message);
      },
    });
  }

  getTimesheet() {
    this.dataload = true
    this.http.getData("TimesheetConfiguration").pipe(takeUntil(this.destroy$)).subscribe({
      next: (res: any) => {
        this.timesheetconfigdata = res.data as any[];
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
    this.selectedExpensesId = expenses.id

    this.timesheetconfigUpdateForm.patchValue({
      applicableForupdate: expenses.applicableFor,
      policyTypeupdate: expenses.policyType,
      descriptionupdate: expenses.description,
      isMandatoryupdate: expenses.isMandatory
    });

    this.modalService.open(content, { centered: true, backdrop: 'static' });
  }


  onUpdateSubmit() {
    if (this.timesheetconfigUpdateForm.invalid) return;

    const payload = {
      id: this.selectedExpensesId,
      policyType: this.timesheetconfigUpdateForm.value.policyTypeupdate,
      applicableFor: this.timesheetconfigUpdateForm.value.applicableForupdate,
      description: this.timesheetconfigUpdateForm.value.descriptionupdate,
      isDeleted: false,
      createdBy: parseInt(this.empinfo.employeeId),
      createdAt: new Date(),
      updatedBy: parseInt(this.empinfo.employeeId),
      updatedAt: new Date(), 
      isMandatory: this.timesheetconfigUpdateForm.value.isMandatoryupdate ? this.timesheetconfigUpdateForm.value.isMandatoryupdate : false
    };

    this.subscription = this.http.putData(`ExpensesCheckListConfiguration/${this.selectedExpensesId}`, payload).subscribe({
      next: (res) => {
        if (res) {
          this.selectedExpensesId = null
          this.modalService.dismissAll()
          this.getTimesheet()
          this.conformationPopup.openSuccessModal('Timesheet Configuration updated successfully')
        }
      },
      error: (err) => {
        console.error('Update failed', err);
        this.conformationPopup.openErrorModal(err.error.message)
      }
    });
  }

  opendelete(content: any, expenses: any) {
    this.selectedExpensesId = expenses.id
    this.modalService.open(content, { centered: true, backdrop: 'static' });
  }

  expemsesDelete() {
    this.subscription = this.http.deleteData(`ExpensesCheckListConfiguration/${this.selectedExpensesId}`).subscribe({
      next: (data: any) => {
        this.modalService.dismissAll()
        this.conformationPopup.openSuccessModal("Timesheet Configuration deleted successfully")
        this.getTimesheet();
      },
      error: (reason: any) => {
        console.log(reason);

      }
    });
  }
  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.complete();
  }
}
