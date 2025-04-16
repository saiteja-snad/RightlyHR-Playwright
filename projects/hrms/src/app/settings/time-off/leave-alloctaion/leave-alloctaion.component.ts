import { Component } from '@angular/core';
import { Subscription } from 'rxjs';
import { ILeavePolicyData, Iorgcategoryleaves, Igradeid } from '../../../Interfaces/timoff-model';
import { ILocation, ISubLocation } from '../flexible-leave-allocation/leave-allocation.model';
import { HttpService } from '../../../services/http.service';
import { EmployeeService } from '../../../services/employee.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
@Component({
  selector: 'app-leave-alloctaion',
  imports: [CommonModule, FormsModule],
  templateUrl: './leave-alloctaion.component.html',
  styleUrl: './leave-alloctaion.component.scss'
})

export class LeaveAlloctaionComponent {
  subscription!: Subscription;
  Leavescat = {} as ILeavePolicyData;
  Leaves = [] as Iorgcategoryleaves[];
  selectedCategory = {} as Iorgcategoryleaves;
  grade = [] as any;
  accessLevels: { [field: number]: number } = {};
  LOGIN = {} as any;
  locationDetails = [] as ILocation[];
  subLocationDetails = [] as ISubLocation[];
  shiftDetails = [] as any[];
  yearsList: number[] = [];

  constructor(private _employeeService: EmployeeService, private http: HttpService) { }

  ngOnInit(): void {
    this.LOGIN = JSON.parse(localStorage.getItem('rightlyHrUser') || '{}');
    this.getLocationDetails();
    this.yearsList = this._employeeService.getYears()
    this.getGradeid();
    this.Leavescat.subLocationId = -1;
    this.Leavescat.shiftId = -1;
    this.Leavescat.categoryId = -1;
  }

  getLocationDetails(): void {
    this.subscription = this.http.getData(`JobLocation`).subscribe({
      next: (data: any) => {
        console.log(data);
        this.locationDetails = data.jobLocations as ILocation[];
      },
    });
  }

  onJobLocationChange(locationId: number) {
    console.log(locationId);
    this.subLocationDetails = this.locationDetails.find((location) => location.id == locationId)?.jobSubLocations as ISubLocation[];
    this.Leavescat.subLocationId = -1;
    this.Leavescat.shiftId = -1;
    this.Leavescat.categoryId = -1;
  }

  enableShift = false;
  getShiftDetailsBySubLocationId(policy: ILeavePolicyData) {
    let date = new Date();
    let params = {
      locationId: policy.locationId,
      subLocationId: policy.subLocationId,
    };
    this.subscription = this.http.getDataWithQueryParams(`orgShifts/getshiftlocation`, params).subscribe({
      next: (data: any) => {
        console.log(data);
        this.enableShift = true
        let shift = data as any[];
        this.shiftDetails = [].concat(...data.map((element: any) => element.orgShiftsItems));
        console.log(this.shiftDetails);
      },
    });
  }

  enableCategory = false;
  getLeaves(policy: ILeavePolicyData) {
    let params = {
      locationId: policy.locationId,
      subLocationId: policy.subLocationId,
      year: policy.year,
      leaveType: 1,
      status: 'Published',
      shiftId: policy.shiftId
    };
    this.subscription = this.http.getDataWithQueryParams('OrgLeavesCategories', params).subscribe({
      next: (data: any) => {
        this.enableCategory = true;
        this.Leaves = data as Iorgcategoryleaves[];
      },
    });
  }

  getGradeid() {
    this.subscription = this.http.getData('Gradetable').subscribe({
      next: (data) => {
        this.grade = data as Igradeid[];
        this.grade.forEach((ele: Igradeid) => { });
        console.log(this.grade);
      },
    });
  }

  onCategoryName(categoryId: number) {
    console.log(categoryId);
    this.selectedCategory = this.Leaves.find((c) => c.id == categoryId) as Iorgcategoryleaves;
    console.log(this.selectedCategory);
    this.getbycategoryid(parseInt(this.selectedCategory.id));
  }

  policyDays: {[field: number]: { allowedDays: number; id: number | null; };} = {};
  getbycategoryid(categoryId: number) {
    let requestData = {
      year: this.Leavescat.year,
      locationId: this.Leavescat.locationId,
      subLocationId: this.Leavescat.subLocationId,
      shiftId: this.Leavescat.shiftId,
      categoryId: this.Leavescat.categoryId,
      entityType: 'Grade',
      status: 'Published',
    } as ILeavePolicyData;

    this.subscription = this.http.postdata(`LeavePolicy/getgeneralpolicies`, requestData).subscribe({
      next: (data: any) => {
        console.log(data);
        if (data.length > 0) {
          data.forEach((element: ILeavePolicyData) => {
            if (element.allowedDays) {
              this.accessLevels[element.entityReferenceId] =
                element.allowedDays;
              // this.policyDays[element.entityReferenceId].id = element.id;
              //this.policyDays[element.entityReferenceId].allowedDays =
              //element.allowedDays;
            } else {
              this.accessLevels[element.allowedDays] = 0;
              // this.policyDays = {
              //   //  element.gradeId
              // }
              //this.policyDays[element.gradeId].lpId = null
            }
          });
        } else {
          this.accessLevels = {};
        }
      },
    });
  }

  Status: any
  gradedata = [] as Igradeid[];
  policySubmit() {
    let rres = this.grade.map((section: Igradeid) => {
      const maxDays = this.accessLevels[section.gradeId];
      console.log(maxDays);
      const categoryId = this.Leavescat.categoryId;
      const gradeId = section.gradeId;
      return {
        year: this.Leavescat.year,
        locationId: this.Leavescat.locationId,
        subLocationId: this.Leavescat.subLocationId,
        shiftId: this.Leavescat.shiftId,
        categoryId: this.Leavescat.categoryId,
        entityType: 'Grade',
        entityReferenceId: gradeId,
        allowedDays: maxDays,
        status: 'Published',
        //lpId
      } as ILeavePolicyData;
    });
    console.log(rres);
    this.subscription = this.http.postdata('LeavePolicy', rres).subscribe({
      next: (res: any) => {
        console.log(res);
        // alert('Policy added successfully');
        // this.toaster.success({ detail: 'Data added', summary: 'Data added successfully', duration: 3000 })
        const modalElement = document.getElementById('successhide');
        if (modalElement) {
          modalElement.classList.add('show');
          modalElement.style.display = 'block';
          this.Status = 'Data added successfully'
        }
        setTimeout(function () {
          window.location.reload();
        }, 2000);
      },
      error: (reason) => console.log(reason),
    });
  }
}