import { CommonModule } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
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

@Component({
  selector: 'app-add-rate-card',
  imports: [RouterModule, Select, ReactiveFormsModule,
    CommonModule, TabsModule, TranslateModule, InfoIconComponent,NgbPopoverModule],
  templateUrl: './add-rate-card.component.html',
  styleUrl: './add-rate-card.component.scss'
})
export class AddRateCardComponent {
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
    this.Employeeinfo = JSON.parse(localStorage.getItem("rightlyHrUser") || '{}');
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
  onLocationChange(id:any){

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
}
