import { Component, TemplateRef, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormArray, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Subject, takeUntil } from 'rxjs';
import { HttpService } from '../../../../services/http.service';
import { OpenModalService } from '../../../../services/open-modal.service';
import { ILocation, ISubLocation, IShiftHeader, IWeekends } from '../pending-weekends/weekends.model';
import { CommonModule } from '@angular/common';
import { SelectModule } from 'primeng/select';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-update-weekends',
  imports: [CommonModule, ReactiveFormsModule, SelectModule, TranslateModule],
  templateUrl: './update-weekends.component.html',
  styleUrl: './update-weekends.component.scss'
})
export class UpdateWeekendsComponent {
  weekendForm!: FormGroup;
  weekendDataLM!: IWeekends;
  showbtn = false;
  yearsList: number[] = [];
  locationDetails = [] as ILocation[];
  subLocationDetails = [] as ISubLocation[];
  shiftDetails = [] as IShiftHeader[];
  currentYear: number = new Date().getFullYear();
  employeedetails = {} as any;
  destroy$: Subject<boolean> = new Subject<boolean>();
  daysList: string[] = [
    'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
  ];
  @ViewChild('confirmation') confirmation!: TemplateRef<any>

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private http: HttpService,
    private modal: OpenModalService,
    private modalService: NgbModal
  ) { }

  ngOnInit() {
    this.employeedetails = JSON.parse(localStorage.getItem("rightlyHrUser") || '{}');
    this.weekendDataLM = JSON.parse(localStorage.getItem("weekend-update") || '{}');
    this.initializeForm();
    // this.handleFormValueChanges();
    this.getAllYears();
    this.getAllLocations();
  }

  navigate() {
    this.router.navigate(['/settings/employee-fields/manage-weekends']);
  }

  navigateToClone() {
    this.router.navigate(['/settings/employee-fields/clone-weekends']);
  }

  initializeForm() {
    this.weekendForm = this.fb.group({
      year: [{ value: '', disabled: true }, Validators.required],
      location: [{ value: '', disabled: true }, Validators.required],
      subLocation: [{ value: '', disabled: true }, Validators.required],
      shift: [{ value: '', disabled: true }, Validators.required],
      weekends: this.fb.array([this.createWeekend()])
    })
  }

  createWeekend(): FormGroup {
    return this.fb.group({
      day: ['', Validators.required],
      week1: [false],
      week2: [false],
      week3: [false],
      week4: [false],
      week5: [false]
    });
  }

  get weekends(): FormArray {
    return this.weekendForm.get('weekends') as FormArray;
  }

  addWeekend() {
    if (this.weekends.length < 3) {
      this.weekends.push(this.createWeekend());
    } else {
      console.warn('Maximum of 7 weekends can be added.');
    }
  }

  removeWeekend(index: number): void {
    this.weekends.removeAt(index);
  }

  getAvailableDays(index: number): { label: string; value: string; disabled: boolean }[] {
    const selectedDays = this.weekends.controls
      .map((group, i) => i !== index ? group.get('day')?.value : null)
      .filter(Boolean);

    return this.daysList.map(day => ({
      label: day,
      value: day,
      disabled: selectedDays.includes(day)
    }));
  }


  get isInitialRowOnly(): boolean {
    return this.weekends.length === this.weekendDataLM.orgWeekendItems.length;
  }

  patchWeekendForm(data: any) {
    if (!data) return;

    const location = this.locationDetails.find(loc => loc.id === data.locationId);

    if (location) {
      this.onLocationChange(location);
    }
    const subLocation = this.subLocationDetails?.find(sub => sub.id === data.subLocationId);

    if (subLocation) {
      this.getAllShifts(subLocation);
    }

    setTimeout(() => {
      const shift = this.shiftDetails.find(sh => sh.id === data.shiftID);

      // 5. Enable fields before patching
      // this.weekendForm.get('location')?.enable();
      // this.weekendForm.get('subLocation')?.enable();
      this.weekendForm.get('shift')?.disable();

      this.weekendForm.patchValue({
        year: data.applicableyear || '',
        location: location || '',
        subLocation: subLocation || '',
        shift: shift || ''
      });
    }, 500);

    this.weekends.clear();
    if (Array.isArray(data.orgWeekendItems)) {
      data.orgWeekendItems.forEach((item: any) => {
        this.weekends.push(this.fb.group({
          day: [item.weekday || '', Validators.required],
          week1: [!!item.firstweek],
          week2: [!!item.secondweek],
          week3: [!!item.thirdweek],
          week4: [!!item.fourthweek],
          week5: [!!item.fifthweek],
        }));
      });
    }
  }

  getAllYears() {
    for (let i = this.currentYear - 1; i <= this.currentYear + 1; i++) {
      this.yearsList.push(i);
    }
  }

  private getAllLocations(): void {
    this.http.getData('JobLocation')
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: any) => {
          this.locationDetails = res.jobLocations || [];
          if (this.weekendDataLM) {
            this.patchWeekendForm(this.weekendDataLM);
          }
        },
        error: err => console.error('Error fetching locations:', err)
      });
  }

  enableLocation(): void {
    if (this.weekendForm.get('year')?.value) {
      this.weekendForm.get('location')?.enable();
    }
  }

  onLocationChange(location: ILocation): void {
    if (location?.jobSubLocations?.length) {
      this.subLocationDetails = location.jobSubLocations;
      // this.weekendForm.get('subLocation')?.enable();
    }
    //  else {
    //   this.subLocationDetails = [];
    //   this.weekendForm.get('subLocation')?.enable();
    //   this.weekendForm.get('subLocation')?.reset();
    // }
  }

  getAllShifts(subLocation: ISubLocation): void {
    const params = {
      locationId: subLocation.jobLocationId,
      subLocationId: subLocation.id
    };

    this.http.getDataWithQueryParams(`orgShifts/getshiftlocation`, params)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: any) => {
          this.shiftDetails = res.flatMap((header: any) => header.orgShiftsItems || []);
          this.weekendForm.get('shift')?.enable();
        },
        error: err => {
          console.error('Error fetching shifts:', err);
          this.shiftDetails = [];
          this.weekendForm.get('shift')?.reset();
          this.weekendForm.get('shift')?.disable();
        }
      });
  }

  private handleFormValueChanges(): void {
    const form = this.weekendForm;

    const resetAndDisable = (controls: string[]) => {
      controls.forEach(control => {
        form.get(control)?.reset();
        form.get(control)?.disable();
      });
    };

    form.get('year')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        form.get('location')?.reset();
        resetAndDisable(['subLocation', 'shift']);
      });

    form.get('location')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        resetAndDisable(['subLocation', 'shift']);
      });

    form.get('subLocation')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        resetAndDisable(['shift']);
      });
  }

  updateWeekend(form: FormGroup) {
    if (form.invalid) {
      form.markAsTouched();
      return;
    }

    const formData = form.value;

    const payload = {
      id: this.weekendDataLM.id,
      locationId: this.weekendDataLM.locationId,
      subLocationId: this.weekendDataLM.subLocationId,
      shiftID: this.weekendDataLM.shiftID,
      applicableyear: this.weekendDataLM.applicableyear,
      status: this.weekendDataLM.status,
      addedby: this.employeedetails.employeeId,
      addedDate: new Date(),
      authorizedby: this.employeedetails.employeeId,
      authorizedDate: new Date(),
      authorizedstatus: "string",
      lastModifedby: this.employeedetails.employeeId,
      lastModifeddate: new Date(),
      orgWeekendItems: formData.weekends.map((row: any) => ({
        headerID: this.weekendDataLM.orgWeekendItems[0].headerId,
        weekday: row.day,
        firstweek: row.week1,
        secondweek: row.week2,
        thirdweek: row.week3,
        fourthweek: row.week4,
        fifthweek: row.week5,
        status: 'Pending for submission'
      }))
    }
    this.http.postdata('OrgWeekendHeader/Update/OrgWeekEnd', payload).pipe(takeUntil(this.destroy$)).subscribe({
      next: (response: any) => {
        this.modal.openSuccessModal('Weekends Updated Successfully!')
        setTimeout(() => {
          this.closeWeekend();
        }, 2000)
      },
      error: (err: any) => {
        this.modal.openErrorModal(err.error.message ? err.error.message : 'Failed to update weekends!')
      }
    });
  }

  publishWeekends() {
    let publishItem = {
      Category: 'Weekend',
      refentityId: this.weekendDataLM.orgWeekendItems[0].headerId
    }
    this.http.postdata(`CompanyRequests/Publish?Category=${publishItem.Category}&refentityId=${publishItem.refentityId}`, { params: publishItem }).
      pipe(takeUntil(this.destroy$)).subscribe({
        next: (response: any) => {
          this.modal.openSuccessModal('Weekends Published Successfully!')
          setTimeout(() => {
            this.closeWeekend();
          }, 2000)
        },
        error: (err: any) => {
          this.modal.openErrorModal(err.error.message ? err.error.message : 'Failed to publish weekends!')
        }
      })
  }

  openConfirmation() {
    this.modalService.open(this.confirmation, { centered: true, backdrop: 'static' })
  }

  closeWeekend() {
    this.modalService.dismissAll();
    this.navigate();
    localStorage.removeItem('weekend-update');
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
}
