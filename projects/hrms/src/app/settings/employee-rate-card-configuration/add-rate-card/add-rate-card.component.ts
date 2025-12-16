import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { NgbPopoverModule, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { Select } from 'primeng/select';
import { TabsModule } from 'primeng/tabs';
import { InfoIconComponent } from '../../../icons/info-icon/info-icon.component';
import { HttpService } from '../../../services/http.service';
import { OpenModalService } from '../../../services/open-modal.service';
import moment from 'moment';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-add-rate-card',
  imports: [RouterModule, Select, ReactiveFormsModule,
    CommonModule, TabsModule, TranslateModule, InfoIconComponent,NgbPopoverModule],
  templateUrl: './add-rate-card.component.html',
  styleUrl: './add-rate-card.component.scss'
})
export class AddRateCardComponent implements OnInit,OnDestroy {
  subscription!: Subscription;
  ratecardForm!:FormGroup
  years: number[] = [];
  Employeeinfo={} as any;
  currentYear: number = moment().year();
  locations=[] as any;
  subLocations=[] as any;
  sublocatiodis = false;
   @ViewChild('deletepopup') deletepopup: any;
  constructor(
    public router: Router,
    private fb: FormBuilder,
    private http: HttpService,
    private modalService: NgbModal,
    private conformationPopup: OpenModalService,
  ) { }

    ngOnInit(): void {
    this.initializeForm();
    this.yearsList();
    this.geAllLocations();
    this.Employeeinfo = JSON.parse(localStorage.getItem("rightlyHrUser") || '{}');
  }
   geAllLocations() {
    this.subscription = this.http.getData(`JobLocation/getAllLocations`).subscribe({
      next: (data: any) => {
        this.locations = data;
        this.sublocatiodis = true;
      },
      error: (reason: any) => console.log(reason)
    });
  }
   initializeForm() {
    this.ratecardForm = this.fb.group({
      year: [new Date().getFullYear(), Validators.required],
      location: ['', Validators.required],
      subLocation: ['', Validators.required],
      rateItems: this.fb.array([this.createShift()])
    });
  }
   get rateItems(): FormArray {
    return this.ratecardForm.get('rateItems') as FormArray;
  }
 addShift() {
    this.rateItems.push(this.createShift());
  }
    createShift(): FormGroup {
    return this.fb.group({
      shiftCode: ['', Validators.required],
      shiftName: ['', Validators.required],
      color: ['#FFFFFF'],
      startTime: ['', Validators.required],
      endTime: ['', Validators.required],
      gracePeriod: [15, Validators.required],
      latesAllowed: [3, Validators.required],
      breakTime: [1, Validators.required],
      halfDayMinHrs: [3, Validators.required],
      fullDayMinHrs: [6, Validators.required],
      punchBeginBefore: [0, [Validators.required, Validators.max(960)]],
      punchEndAfter: [0, [Validators.max(960)]],
    });
  }
    isDeleteDisabled: boolean = false;
  deleteShift(index: number) {
    if (this.rateItems.length > 1) {
      this.rateItems.removeAt(index);
      this.isDeleteDisabled = false; // allow delete if more than 1
    } else {
      this.isDeleteDisabled = true; // disable delete button
    }
  }
  yearsList() {
    for (let i = this.currentYear - 1; i <= this.currentYear + 1; i++) {
      this.years.push(i);
    }
  }
addRateCard(){

  }
   // location changes
  onLocationChange(selectedLocationId: number | null) {
    const subLocationControl = this.ratecardForm.get('subLocation');
    // Reset subLocation value
    subLocationControl?.reset();
    if (selectedLocationId) {
      // Enable subLocation field
      subLocationControl?.enable();
      // Find the selected location object
      const selectedLocation = this.locations.find(
        (loc:any) => loc.id === selectedLocationId
      );
      // Extract subLocations
      this.subLocations = selectedLocation?.subLocations || [];
      this.ratecardForm.get('subLocation')?.markAsTouched();
    } else {
      // Disable if location is invalid
      subLocationControl?.disable();
      this.subLocations = [];
    }
  }
nagvition(){
    this.router.navigate(['/settings/employee-rate-card/rate-card/rate-card-active']);
}
 Cancel() {
    this.modalService.open(this.deletepopup, { backdrop: 'static', centered: true });
  }
   onDelete(modal: any) {
    modal.dismiss();
    this.nagvition();
  }

  closeDelete(modal: any) {
    modal.dismiss();
  }
    ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
