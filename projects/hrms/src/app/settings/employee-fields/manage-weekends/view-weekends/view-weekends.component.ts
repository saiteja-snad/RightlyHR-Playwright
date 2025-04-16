import { CommonModule } from '@angular/common';
import { Component, TemplateRef, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { SelectModule } from 'primeng/select';
import { Subject, takeUntil } from 'rxjs';
import { HttpService } from '../../../../services/http.service';
import { OpenModalService } from '../../../../services/open-modal.service';
import { IWeekends, ILocation, ISubLocation, IShiftHeader } from '../pending-weekends/weekends.model';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-view-weekends',
  imports: [CommonModule, SelectModule, ReactiveFormsModule, TranslateModule],
  templateUrl: './view-weekends.component.html',
  styleUrl: './view-weekends.component.scss'
})
export class ViewWeekendsComponent {
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
    private modalService: NgbModal
  ) { }

  ngOnInit() {
    this.weekendDataLM = JSON.parse(localStorage.getItem("weekend-update") || '{}');
    this.initializeForm();
    this.getAllYears();
    this.getAllLocations();
  }

  navigate() {
    this.router.navigate(['/settings/employee-fields/manage-weekends/published-weekends']);
  }

  initializeForm() {
    this.weekendForm = this.fb.group({
      year: [{ value: '', disabled: true }],
      location: [{ value: '', disabled: true }],
      subLocation: [{ value: '', disabled: true }],
      shift: [{ value: '', disabled: true }],
      weekends: this.fb.array([this.createWeekend()])
    })
  }

  createWeekend(): FormGroup {
    return this.fb.group({
      day: [{ value: '', disabled: true }],
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
    this.weekends.push(this.createWeekend());
  }

  removeWeekend(index: number): void {
    this.weekends.removeAt(index);
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
          day: [{ value: item.weekday || '', disabled: true }],
          week1: [{ value: !!item.firstweek, disabled: true }],
          week2: [{ value: !!item.secondweek, disabled: true }],
          week3: [{ value: !!item.thirdweek, disabled: true }],
          week4: [{ value: !!item.fourthweek, disabled: true }],
          week5: [{ value: !!item.fifthweek, disabled: true }],
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
    }
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
        },
        error: err => {
          console.error('Error fetching shifts:', err);
          this.shiftDetails = [];

        }
      });
  }

  openConfirmation() {
    this.modalService.open(this.confirmation, { centered: true, backdrop: 'static' })
  }

  closeWeekend() {
    this.modalService.dismissAll();
    this.navigate();
    localStorage.removeItem('weekend-update');
  }

  navigateToClone() {
    this.router.navigate(['/settings/employee-fields/clone-weekends']);
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
}
