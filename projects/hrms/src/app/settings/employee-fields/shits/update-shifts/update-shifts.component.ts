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
  selector: 'app-update-shifts',
  imports: [
    RouterModule,
    Select,
    ReactiveFormsModule,
    CommonModule,
    TabsModule,TranslateModule
  ],
  templateUrl: './update-shifts.component.html',
  styleUrl: './update-shifts.component.scss'
})
export class UpdateShiftsComponent {
  @ViewChild('deletepopup') deletepopup: any;
  shiftForm!: FormGroup;
  years: { label: string; value: number }[] = [];
  id:any;
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
  hideBUTTON = false;
  navTabs: any[] = [
    { label: 'Update Shifts', link: '/claimsandexpenses/addexpens' },
  ];

  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private router: Router,
    private http: HttpService,
   private conformationPopup: OpenModalService,
   private modalService: NgbModal
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
       id:[this.route.snapshot.paramMap.get('id')],
      shifts: this.fb.array([this.createShift()])
    });
  }


  addShift() {
    this.shifts.push(this.createShift());
    this.hideBUTTON = true;
  }

  get shifts(): FormArray {
    return this.shiftForm.get('shifts') as FormArray;
  }

  createShift(shiftData: any = null): FormGroup {
    return this.fb.group({
      id: this.route.snapshot.paramMap.get('id'),
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
          year: data.applicableyear,
          location: data.locationId,
          subLocation: data.subLocationId,
          id:data.id,
        });
        this.shiftDATA = data.subLocationId;
        this.selectedLocationId = data.locationId;
        console.log("Selected Locationid:", this.selectedLocationId);
        console.log(this.shiftDATA);
       
         this.onLocationChange(data.locationId); // to load sublocations
        const shiftArray = this.shiftForm.get('shifts') as FormArray;
        shiftArray.clear(); // remove any existing default shift

        data.orgShiftsItems.forEach((item: any) => {
          shiftArray.push(this.fb.group({
            shiftCode: [item.code],
            shiftName: [item.shiftName],
            color: [item.color],
            id:[item.id],
            headerID: [data.id],
            startTime: [item.shiftStartTime],
            endTime: [item.shiftEndTime],
            gracePeriod: [item.allowedGracePeriod],
            latesAllowed: [item.latesAllowed],
            breakTime: [item.allowedBreakTime],
            halfDayMinHrs: [item.halfDayMinHrs],
            fullDayMinHrs: [item.fullDayMinHrs],
            
          }));
        });
        this.shiftid =data.orgShiftsItems.forEach((items: any) => {
          console.log('this.shiftid ',items.id );

        });
        
      },
      // startTime: [item.shiftStartTime.split(':')[0]],
      //       endTime: [item.shiftEndTime.split(':')[1]],
      error: (err: any) => console.error('Error loading shift data', err)
    });
  }

  Status: any;
  hoildaylist: any;
  updateshift(f: FormGroup){
   
 
    if (this.shiftForm.valid) {
      const formValue = this.shiftForm.value;
      // formValue.shifts.forEach((shift: any, index: number) => {
      //   if (!shift.id) {
      //     shift.id = shift.id+ index; // or any logic to get next unique ID
      //    }
      // });
      const payload = {
        id: this.route.snapshot.paramMap.get('id'),
        locationId: formValue.location,
        subLocationId: formValue.subLocation,
        applicableyear: formValue.year,
        status: "Pending for Submission",
         addedby: this.Employeeinfo.employeeId,
        addedDate: new Date(),
        lastModifeddate:new Date(),
        orgShiftsItems: formValue.shifts.map((shift: any,index:any) => ({
          shiftName: shift.shiftName,
          id:  shift.id,
          headerID: this.route.snapshot.paramMap.get('id'),
          shiftStartTime: shift.startTime,
          shiftEndTime: shift.endTime,
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
      
      this.http.postdata(`orgShifts/Update/Shift/OrgShift`, payload).subscribe({
        next: (data: any) => {
          console.log('updaTE DATA',data);
          if (data.statusCode === 400) {
            alert('Error: Shift already exists.');
          } else {
            this.hoildaylist = data;
  console.log('  this.hoildaylist ',  this.hoildaylist );
  this.conformationPopup.openSuccessModal('Shift Updated successfully');
  this.nagvition();
           }
        },
        error: (error: any) => {
          console.log("error" + error)
        }
      });
    }
  
   }
Cancel(){
  this.modalService.open(this.deletepopup, { backdrop: 'static', centered: true });
}
cloneshiftsPolicy1(id: any): void {
  this.router.navigate(['/settings/employee-fields/cloneshifts',this.route.snapshot.paramMap.get('id')]);
}
publish() {
  let publishItem = {
    Category: 'shifts',
    refentityId: this.shiftForm.value.shifts[0].headerID
  }
  this.subscription = this.http.postdata(`CompanyRequests/Publish?Category=${publishItem.Category}&refentityId=${publishItem.refentityId}`, { params: publishItem }).subscribe({
    next: (respnose: any) => {
      console.log(respnose);
      const modalElement = document.getElementById('successhide');
      if (modalElement) {
        modalElement.classList.add('show');
        modalElement.style.display = 'block';
        this.Status = 'Shift Published successfully'
       
      }
      this.conformationPopup.openSuccessModal('Shift Published successfully');
      setTimeout( () => {
        this.nagvition();
      }, 2000);
      

    }
  })
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
  onDelete(modal:any){
    modal.dismiss();
this.nagvition();
  }
  closeDelete(modal:any){
    modal.dismiss();
  }
  nagvition() {
    // this.router.navigate(['/settings/employee-fields/shits/published-shits']);
    this.router.navigate(['/settings/employee-fields/manage-shifts/pending-for-submit']);
  }
}
