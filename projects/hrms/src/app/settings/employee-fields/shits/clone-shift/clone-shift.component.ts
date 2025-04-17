import { CommonModule } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Select } from 'primeng/select';
import { TabsModule } from 'primeng/tabs';
import { HttpService } from '../../../../services/http.service';
import { Subscription } from 'rxjs';
import { OpenModalService } from '../../../../services/open-modal.service';
import { TranslateModule } from '@ngx-translate/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';


@Component({
  selector: 'app-clone-shift',
  imports: [
    RouterModule,
    Select,
    ReactiveFormsModule,
    CommonModule,
    TabsModule,TranslateModule,TranslateModule
  ],
  templateUrl: './clone-shift.component.html',
  styleUrl: './clone-shift.component.scss'
})
export class CloneShiftComponent {

  @ViewChild('deletepopup') deletepopup: any;
  shiftForm!: FormGroup;
  years: { label: string; value: number }[] = [];
  locations: any[] = [];
  subLocations: any[] = [];
  subscription!: Subscription;
  Employeeinfo = {} as any;
  currentYear: number = new Date().getFullYear();
  shiftId!: number;
  shiftDATA:any;
  selectdata:any;
  selectedLocationId:any;
  matchedSubLocation:any;
  selectedLocation:any;
  shiftid:any;
  navTabs: any[] = [
    { label: 'Clone Shifts', link: '/claimsandexpenses/addexpens' },
  ];

  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private router: Router,
    private http: HttpService,
   private conformationPopup: OpenModalService,
   private modalService: NgbModal,
      
  ) { }

  ngOnInit(): void {
    this.initializeForm();
    this.yearsList();
    this.geAllLocations();
    this.Employeeinfo = JSON.parse(localStorage.getItem("rightlyHrUser") || '{}');

    const shiftId = this.route.snapshot.paramMap.get('id');
    if (shiftId) {
      this.getShiftById(shiftId);
    }
  }

  Cancel(){
    this.modalService.open(this.deletepopup, { backdrop: 'static', centered: true });

  }
  yearsList() {
    for (let i = this.currentYear - 1; i <= this.currentYear + 1; i++) {
      this.years.push({ label: i.toString(), value: i });
    }
  }

  initializeForm() {
    this.shiftForm = this.fb.group({
      year: ['', Validators.required],
      location: ['', Validators.required],
      subLocation: ['', Validators.required],
      // id:[['', Validators.required]],
      shifts: this.fb.array([this.createShift()])
    });
  }


  addShift() {
    this.shifts.push(this.createShift());
  }

  get shifts(): FormArray {
    return this.shiftForm.get('shifts') as FormArray;
  }

  createShift(shiftData: any = null): FormGroup {
    return this.fb.group({
      shiftCode: [shiftData?.code || '', Validators.required],
      shiftName: [shiftData?.shiftName || '', Validators.required],
      color: [shiftData?.color || '#00ff00'],
      startTime: [shiftData?.shiftStartTime?.split(':')[0] || '', Validators.required],
      endTime: [shiftData?.shiftStartTime?.split(':')[1] || '', Validators.required],
      gracePeriod: [shiftData?.allowedGracePeriod ||'', Validators.required],
      latesAllowed: [shiftData?.latesAllowed || '', Validators.required],
      breakTime: [shiftData?.allowedBreakTime || '', Validators.required],
      halfDayMinHrs: [shiftData?.halfDayMinHrs || '', Validators.required],
      fullDayMinHrs: [shiftData?.fullDayMinHrs || '', Validators.required],
    });
  }

  getShiftById(id: string) {
    this.http.getData(`orgShifts/getbyid/${id}`).subscribe({
      next: (data: any) => {
        this.shiftForm.patchValue({
          year: '',
          location:'',
          subLocation: '',
          id:data.id,
        });
        this.shiftDATA = '';
        this.selectedLocationId = data.locationId;
        console.log("Selected Locationid:", this.selectedLocationId);
        console.log(this.shiftDATA);
       
         this.onLocationChange(data.locationId); // to load sublocations
        const shiftArray = this.shiftForm.get('shifts') as FormArray;
        shiftArray.clear(); // remove any existing default shift

        data.orgShiftsItems.forEach((item: any) => {
          shiftArray.push(this.fb.group({
            shiftCode: '',
            shiftName: '',
            color: '',
            id:'',
            headerID: '',
            startTime: '',
            endTime: '',
            gracePeriod: '',
            latesAllowed: '',
            breakTime: '',
            halfDayMinHrs: '',
            fullDayMinHrs: '',
            
          }));
        });
        // this.shiftid =data.orgShiftsItems.forEach((items: any) => {
        //   console.log('this.shiftid ',items.id );

        // });
        
      },
      // startTime: [item.shiftStartTime.split(':')[0]],
      //       endTime: [item.shiftEndTime.split(':')[1]],
      error: (err: any) => console.error('Error loading shift data', err)
    });
  }

  Status: any;
  hoildaylist: any;
  Addshift(f: FormGroup){
   
 
    if (this.shiftForm.valid) {
      const formValue = this.shiftForm.value;

      const payload = {
        locationId: formValue.location,
        subLocationId: formValue.subLocation,
        applicableyear: formValue.year,
        status: "Pending for Submission",
        addedby: this.Employeeinfo.employeeId,
        addedDate: new Date(),
        orgShiftsItems: formValue.shifts.map((shift: any) => ({
          shiftName: shift.shiftName,
          shiftStartTime: shift.startTime + ':' + shift.endTime,
          shiftEndTime: shift.startTime + ':' + shift.endTime,
          shiftDescription: "hi",
          status: "Submitted",
          code: shift.shiftCode,
          color: shift.color,
          allowedGracePeriod: shift.gracePeriod,
          latesAllowed: shift.latesAllowed,
          allowedBreakTime: shift.breakTime,
          halfDayMinHrs: shift.halfDayMinHrs,
          fullDayMinHrs: shift.fullDayMinHrs,
        }))
      };
      
      this.http.postdata(`orgShifts/Post/Shift/OrgShift`, payload).subscribe({
        next: (data: any) => {
        console.log("submited");
          this.nagvition()
        },
        error: (error: any) => {
          console.log("error" + error)
        }
      });
    }
   }


   onDelete(modal:any){
    modal.dismiss();
this.nagvition();
  }
  closeDelete(modal:any){
    modal.dismiss();
  }
  onLocationChange(selectedLocationId: number | null) {
    const subLocationControl = this.shiftForm.get('subLocation');
    // subLocationControl?.reset();

    if (selectedLocationId) {
      subLocationControl?.enable();
      const selectedLocation = this.locations.find(loc => loc.id === selectedLocationId);
      this.subLocations = selectedLocation?.subLocations||[];
      this.selectdata = this.subLocations.find(loc => loc.id === this.shiftDATA);
      if (this.selectdata) {
        subLocationControl?.setValue(this.selectdata.id); // ensure `optionValue="id"` is used in p-select
      }
      console.log(this.subLocations);
      console.log(this.selectdata);
    } else {
      subLocationControl?.disable();
      this.subLocations = [];
    }
  }
 
  sublocation:any;
  geAllLocations() {
    this.subscription = this.http.getData(`JobLocation/getAllLocations`).subscribe({
      next: (data: any) => {
        this.locations = data;
        this.selectedLocation = this.locations.find(loc => loc.id === this.selectedLocationId);
        console.log(this.selectedLocation);
        console.log("Selected Location:", this.selectedLocation);
        this.sublocation = this.selectedLocation.subLocations;
        // console.log("Selected sublocation:", sublocation);
        const sublocationdata = this.sublocation.find(
          (sub: any) => sub.id === this.shiftDATA
        );
        
        if (sublocationdata) {
          console.log("Matched Sub Location ID:", sublocationdata.id);
          console.log("Selected Sub Location Name:", sublocationdata.jobSubLocationName);
            this.matchedSubLocation = sublocationdata;
            if (this.matchedSubLocation) {
             // Set the value to form
              this.shiftForm.patchValue({ subLocation: this.matchedSubLocation.id });
      
              // Optionally store matched name for display/logging
              this.matchedSubLocation = this.matchedSubLocation.jobSubLocationName;
            }
          }
      },
      error: (reason: any) => console.log(reason)
     });
  }

  nagvition() {
    // this.router.navigate(['/settings/employee-fields/shits/published-shits']);
    this.router.navigate(['/settings/employee-fields/manage-shifts/pending-for-submit']);
  }
}
