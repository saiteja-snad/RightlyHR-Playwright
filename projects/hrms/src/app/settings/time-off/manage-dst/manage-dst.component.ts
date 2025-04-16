import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { IJob } from '../../../Interfaces/letters-model';
import { Subject, takeUntil } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { SelectModule } from 'primeng/select';
import { HttpService } from '../../../services/http.service';
import { OpenModalService } from '../../../services/open-modal.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ILocation, IShiftHeader, ISubLocation } from '../flexible-leave-allocation/leave-allocation.model';



@Component({
  selector: 'app-manage-dst',
  imports: [SelectModule, CommonModule,ReactiveFormsModule],
  templateUrl: './manage-dst.component.html',
  styleUrl: './manage-dst.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class ManageDstComponent implements OnInit,OnDestroy{
  dstForm!: FormGroup;
  yearsList: number[] = [];
  empinfo = {} as IJob;
  destroy$: Subject<boolean> = new Subject<boolean>();
  locationDetails!: ILocation[];
  subLocationDetails = [] as ISubLocation[];
  shiftDetails = [] as IShiftHeader[];
  momentType:string[] = ['Forward','Backward'];
  durations: number[] = [1, 1.5, 2, 2.5, 3];

  constructor(
    private fb: FormBuilder,
    private http: HttpService,
     private sharedModalService: OpenModalService,
     private modalService: NgbModal,
  ) { }
  ngOnInit(): void {
    this.yearsList = this.getYears();
    this.empinfo = JSON.parse(localStorage.getItem('rightlyHrUser') ?? '{}');
    this.inititializeForm();
    this.getAllLocations();
    
  }



  inititializeForm() {
    this.dstForm = this.fb.group({
      year: ['', Validators.required],
      location: [null, Validators.required],
      subLocation: [null, Validators.required],
      shift: [null, Validators.required],
      momentRows: this.fb.array([this.createMomentRow()]) // initialize with one row
    });
  }

  private getAllLocations(): void {
    this.http.getData('JobLocation')
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: any) => this.locationDetails = res.jobLocations || [],
        error: err => console.error('Error fetching locations:', err)
      });
  }

  createMomentRow(): FormGroup {
    return this.fb.group({
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      momentType: [null, Validators.required],
      duration: [null, Validators.required]
    });
  }
  
  get momentRows(): FormArray {
    return this.dstForm.get('momentRows') as FormArray;
  }
  
  addMomentRow() {
    if (this.momentRows.length < 4) {
      this.momentRows.push(this.createMomentRow());
    } else {
     
    }
  }
  
  
  removeMomentRow(index: number) {
    this.momentRows.removeAt(index);
  }



  


  
  private getYears(): number[] {
    const currentYear = new Date().getFullYear();
    let yearsList: number[] = []
    for (let i = -1; i < 11; i++) {
      yearsList.push(currentYear + i);
    }
    return yearsList;
  }

  onLocationChange(location: ILocation): void {
    if (location?.jobSubLocations?.length) {
      this.subLocationDetails = location.jobSubLocations;
      this.dstForm.get('subLocation')?.enable();
    } else {
      this.subLocationDetails = [];
      this.dstForm.get('subLocation')?.enable();
      this.dstForm.get('subLocation')?.reset();
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
          this.dstForm.get('shift')?.enable();
        },
        error: (err) => {
          console.error('Error fetching shifts:', err);
          this.shiftDetails = [];
          this.dstForm.get('shift')?.reset();
          this.dstForm.get('shift')?.disable();
        }
      });
  }

  onSubmit(dstForm:FormGroup) {
    if (dstForm.invalid) {
      this.dstForm.markAllAsTouched();
      return;
    }
  
    const formValue = this.dstForm.value;
  
    const manageDST = {
      lastModifiedDate: new Date(),
      addedDate: new Date(),
      status: "Pending for submission",
      addedBy: this.empinfo.employeeId,
      lastModifiedBy: this.empinfo.employeeId,
      applicableYear: formValue.year,
      sublocationId: formValue.subLocation.id,
      shiftId: formValue.shift.id,
      locationId: formValue.location.id,
      dayLight: formValue.momentRows.map((row: any) => ({
        startDate: row.startDate,
        endDate: row.endDate,
        momentType: row.momentType,
        duration: row.duration
      }))
    };
  
    console.log('Payload:', manageDST);
  
     this.http.postdata('OrgDayLight/Post/Shift/OrgShift', manageDST).subscribe({
      next: (response: any) => {
        console.log(response);
      this.sharedModalService.openSuccessModal("Manage DST added Successfully")
        
      },
      error: (err) => {
        this.sharedModalService.openErrorModal('Shift already exists with the year , location and sub location')
        
      },complete: () =>{
        
      }
    });
  }
  

  
  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
}
