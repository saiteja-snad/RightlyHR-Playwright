import { Component, OnDestroy, OnInit } from '@angular/core';
import { CompOffApprovalTabsComponent } from '../../shared/comp-off-approval-tabs/comp-off-approval-tabs.component';
import { RouterModule } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { IJob } from '../../Interfaces/letters-model';
import { Subject, takeUntil } from 'rxjs';
import { HttpService } from '../../services/http.service';
import { LeaveConfigurationSetting, OrgHolidayHeader, OrgWeekendHeader } from '../../Interfaces/compoff.modal';
import { CommonModule } from '@angular/common';
import { Ileavesdatas } from '../../Interfaces/timoff-model';


@Component({
  selector: 'app-comp-off',
  imports: [CompOffApprovalTabsComponent, RouterModule, ReactiveFormsModule,CommonModule],
  templateUrl: './comp-off.component.html',
  styleUrl: './comp-off.component.scss',
})
export class CompOffComponent implements OnInit, OnDestroy {
  addCompOffForm!: FormGroup;
  empinfo = {} as IJob;
  destroy$: Subject<boolean> = new Subject<boolean>();
  holidaysData!: OrgHolidayHeader;
  weekendsData!: OrgWeekendHeader;
  compOffEligibilityCriteria:LeaveConfigurationSetting[] = [];
  filteredMinhoursData!:LeaveConfigurationSetting;
  compoffdata = {} as Ileavesdatas;
  constructor(
    private modalService: NgbModal,
    private fb: FormBuilder,
    private http: HttpService
  ) {}

  ngOnInit(): void {
    this.empinfo = JSON.parse(localStorage.getItem('rightlyHrUser') ?? '{}');
    console.log(this.empinfo);

    this.intializeCompOffForm();
    this.getWorkfromhomeCriteria();
    this.getEmployeeeHolidays();
    this.getEmployeeeWeekends();
  }

  openModal(content: any) {
    this.modalService.open(content, { centered: true, backdrop: 'static' });
  }

  intializeCompOffForm() {
    this.addCompOffForm = this.fb.group({
      workedDate: ['', Validators.required],
      availing: ['', Validators.required],
      halfType: [''],
      reason: ['', Validators.required]
    });
  }

  handleAvailingChange() {
    this.addCompOffForm.get('availing')?.valueChanges.subscribe(value => {
      const halfTypeControl = this.addCompOffForm.get('halfType');
      if (value === 'Half Day') {
        halfTypeControl?.setValidators(Validators.required);
      } else {
        halfTypeControl?.clearValidators();
        halfTypeControl?.setValue(null);
      }
      halfTypeControl?.updateValueAndValidity();
    });
  }

  applyCompOff(addForm:FormGroup) {

    if(addForm.valid) {

    const  formData = addForm.value
    const payload = {
        empId: 0,
        startTime: this.compoffdata.startdate,
        endTime: this.compoffdata.startdate,
        requestedComments: this.compoffdata.requestedComments,
        durationType: formData.availing,
        duration: 0,
        status: "Waiting for Approval",
        reason: formData.value.reason,
        requestedCategory:3,
        requestedBy:this.empinfo.employeeId,
        requestedDate: new Date()

    }

  }

    throw new Error('Method not implemented.');
  }

  getEmployeeeHolidays() {
    let EmployeeId = parseInt(this.empinfo.employeeId);
    console.log(EmployeeId);
    this.http
      .getData(`orgHolidays/getOrgHoliday/${EmployeeId}`)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: any) => {
          this.holidaysData = data;
          console.log('Holidays', this.holidaysData);
        },
      });
  }

  getWorkfromhomeCriteria() {
     this.http.getData(`CompOffEligibilityCriteria`)
     .pipe(takeUntil(this.destroy$))
     .subscribe({
      next: (response: any) => {
        console.log(response);
        this.compOffEligibilityCriteria = response
        const filterHalfDayData = this.compOffEligibilityCriteria.find((item: any) =>
          item.name === "minHalfDayHours"
        )
        const filterminhoursData = this.compOffEligibilityCriteria.find((item: any) =>
        item.name === "maxDuration"
      )
      this.filteredMinhoursData = filterminhoursData ?? {} as LeaveConfigurationSetting;
        console.log(filterHalfDayData);

        localStorage.setItem('filterHalfDayData', JSON.stringify(filterHalfDayData));
        const filterFullDayData = this.compOffEligibilityCriteria.find((item: any) =>
          item.name === "minFullDayHours"
        )
        console.log(filterFullDayData)
        localStorage.setItem('filterFullDayData', JSON.stringify(filterFullDayData));
      },
      error: (error) => {
        console.error('Error fetching rides:', error);
        this.compOffEligibilityCriteria = []; // Set to empty array on error
      },
    })
  }

  getEmployeeeWeekends() {
    let EmployeeId = parseInt(this.empinfo.employeeId);
    console.log(EmployeeId);
    this.http
      .getData(`OrgWeekendHeader/getOrgWeekendByEmpId/${EmployeeId}`)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: any) => {
          
          this.weekendsData = data;
          console.log(this.weekendsData);
        },
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
}
