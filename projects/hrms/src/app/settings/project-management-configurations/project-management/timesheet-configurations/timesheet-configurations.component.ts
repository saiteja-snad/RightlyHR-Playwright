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

@Component({
  selector: 'app-timesheet-configurations',
  imports: [ReactiveFormsModule, TranslateModule, CommonModule,SelectModule,NgbPopoverModule],
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
  applicableforoption = [
    // { label: 'TM', value: 'TM' },
    // { label: 'RM', value: 'RM' },
    { label: 'HR', value: 'HR' },
    // { label: 'Role', value: 'ROLE' }
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
    this.getExpenses();
  }
  intiationalfrom() {
    this.timesheetconfigForm = this.fb.group({
      policyType: ['', [Validators.required, Validators.maxLength(50), Validators.pattern(/^[^\s].*$/)]],
      applicableFor: ['', [Validators.required, Validators.maxLength(50), Validators.pattern(/^[^\s].*$/)]],
      description: ['',[Validators.maxLength(250)]],
      isMandatory: [false]
    });
  }

  intiationalupdatefrom() {
    this.timesheetconfigUpdateForm = this.fb.group({
      policyTypeupdate: ['', [Validators.required, Validators.maxLength(50), Validators.pattern(/^[^\s].*$/)]],
      applicableForupdate: ['', [Validators.required, Validators.maxLength(50), Validators.pattern(/^[^\s].*$/)]],
      descriptionupdate: [ '',[Validators.maxLength(250)],],
      isMandatoryupdate: [false]
    });
  }

  openModal(content: any) {
    this.modalService.open(content, { centered: true, backdrop: 'static' });
  }
  postExpenses(f: FormGroup) {
    if (f.invalid) return;

    const payload = {
      policyType: f.value.policyType,
      applicableFor: f.value.applicableFor,
      description: f.value.description,
      isDeleted: false,
      createdBy: parseInt(this.empinfo.employeeId),
      createdAt: moment().format('YYYY-MM-DD'),
      isMandatory: f.value.isMandatory ? f.value.isMandatory : false,
    };

    this.subscription = this.http.postdata("ExpensesCheckListConfiguration", payload).pipe(takeUntil(this.destroy$)).subscribe({
      next: (data: any) => {
        this.modalService.dismissAll()
        this.conformationPopup.openSuccessModal("Expense Checklist added successfully");
        f.reset();
        this.getExpenses();
      },
      error: (reason: any) => {
        this.conformationPopup.openErrorModal(reason.error.message);
      },
    });
  }

  getExpenses() {
    this.dataload = true
    this.http.getData("ExpensesCheckListConfiguration/getall").pipe(takeUntil(this.destroy$)).subscribe({
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
          this.getExpenses()
          this.conformationPopup.openSuccessModal('Expense Checklist updated successfully')
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
        this.conformationPopup.openSuccessModal("Expense Checklist deleted successfully")
        this.getExpenses();
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
