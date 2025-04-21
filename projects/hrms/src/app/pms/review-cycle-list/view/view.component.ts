import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { HttpService } from '../../../services/http.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Subscription } from 'rxjs';
import { FormGroup } from '@angular/forms';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-view',
  imports: [],
  templateUrl: './view.component.html',
  styleUrl: './view.component.scss'
})
export class ViewComponent implements OnInit, OnDestroy {
  subscription!: Subscription;
  jobLocationDropDownData: any
  subLocationsDropdown: any
  departmentDetails: any
  reviewCycleForm!: FormGroup;
  reviewCycleupdateForm!: FormGroup;
  subDepartmentsDropdownValues: any;
  listofReviewTemplates: any;
  ReviewCycleTypes: any
  @ViewChild('viewreviewcycle') viewreviewcycle: any;
  
  constructor(private router: Router, private http: HttpService, private modalService: NgbModal) {

  }

  ngOnInit(): void {

  }

  Viewintial(cycle: any) {
    this.openinitalView()
    let locationIds = cycle.locations.map((item: any) => item.locationId).join(',');
    let subLocationIds = cycle.sublocations.map((item: any) => item.subLocationId).join(',');
    let depIds = cycle.departments.map((item: any) => item.departmentId).join(',')
    let subDepIds = cycle.subdepartments.map((item: any) => item.subDepartmentId).join(',')
    const formatDate = (date: any) => {
      const d = new Date(date);
      return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`;
    };
    this.reviewCycleupdateForm.patchValue({
      reviewCycleName: cycle.reviewCycleName,
      startDate: formatDate(cycle.startDate), // Format to YYYY-MM-DD
      endDate: formatDate(cycle.endDate),
      //dueDate: formatDate(cycle.dueDate),
      reviewCycleType: cycle.reviewCycleType,
      applicableForIncrement: cycle.applicableForIncrement,
      applicableEmployeesJoinedBefore: formatDate(cycle.applicableEmployeesJoinedBefore),
      departmentId: depIds.split(',').map(Number),
      subDepartmentId: subDepIds.split(',').map(Number),
      locationId: locationIds.split(',').map(Number),
      subLocationId: subLocationIds.split(',').map(Number),
      reviewTemplateId: cycle.reviewTemplateId,
      status: cycle.status,
      description: cycle.description,
      id: cycle.id
    });
    this.getSubLocationByid(locationIds)
    this.getSubDepartmentsByDepID(depIds)
  }

  openinitalView() {
    this.getAllLocations()
    this.getAllDepartments()
    this.getAllReviewCycleTypes()
    this.getAllReviewTemplates()
    this.modalService.open(this.viewreviewcycle, {
      size: 'lg',
      centered: true,
    });
  }

  getAllLocations() {
    this.subscription = this.http.getData("JobLocation/getAllLocations").subscribe({
      next: (data: any) => {
        this.jobLocationDropDownData = data.map((location: any) => {
          return {
            ...location,
            fullName: `${location.jobLocationName}`,
            selectedAllGroup: 'Group 3',
          };
        });
      }
    })
  }

  getSubLocationByid(ValuesForSublocation: any) {
    this.subscription = this.http.getData(`JobLocation/v2/sub-location-by-joblocation/${ValuesForSublocation}`).subscribe({
      next: (data: any) => {
        console.log(data);
        this.subLocationsDropdown = data.jobSubLocations.map((subLocation: any) => {
          return {
            ...subLocation,
            fullName: `${subLocation.subLocationName}`, // You can modify this based on the actual property
            selectedAllGroup: 'Group 4', // Add grouping or additional properties if needed
          };
        });
      }
    })
  }
  
  getAllReviewTemplates() {
    const params = {
      moduleid: environment.PMSrequestmoduleId,
    }
    this.subscription = this.http.getDataIncludeParams("Form/getAllFormDetails", params).subscribe({
      next: (data: any) => {
        this.listofReviewTemplates = data
      }
    })
  }

  getAllDepartments() {
    this.subscription = this.http.getData("Department").subscribe({
      next: (data: any) => {
        console.log(data);
        this.departmentDetails = data.map((department: any) => {
          return {
            ...department,
            fullName: `${department.departmentName}`,
            selectedAllGroup: 'Group 1',
          };
        });
      }
    })
  }

  getSubDepartmentsByDepID(id: any) {
    this.subscription = this.http.getData(`Subdepartments/Getnames/V2/${id}`).subscribe({
      next: (data: any) => {
        this.subDepartmentsDropdownValues = data.map((subDepartment: any) => {
          return {
            ...subDepartment,
            fullName: `${subDepartment.subDepartmentName}`,
            selectedAllGroup: 'Group 2',
          };
        });
      }
    })
  }

  getAllReviewCycleTypes() {
    const params = {
      entity: "PMS",
      attribute: "reviewType"
    }
    this.subscription = this.http.getDataIncludeParams("entityAttributeValues", params).subscribe({
      next: (data: any) => {
        console.log(data);
        this.ReviewCycleTypes = data
      }
    })
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe()
    }
  }
}
