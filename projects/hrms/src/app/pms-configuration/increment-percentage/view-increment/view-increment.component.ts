import { CommonModule } from '@angular/common';
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormsModule, NgForm } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { Select } from 'primeng/select';
import { Subscription } from 'rxjs';
import { HttpService } from '../../../services/http.service';
import { RbacService } from '../../../services/rbac.service';
import { IReviewCycle } from '../add-increment/increment.modal';
@Component({
  selector: 'app-view-increment',
  imports: [ CommonModule, ReactiveFormsModule, FormsModule, Select, TranslateModule],
  templateUrl: './view-increment.component.html',
  styleUrl: './view-increment.component.scss',
})

export class ViewIncrementComponent implements OnInit, OnDestroy {
  empinfo = {} as any;
  subscription!: Subscription;
  ratingrangeloop: number[] = [];
  UpdateIncrementalpercentage = {} as any;
  deletedRows: any[] = [];
  ratingscaledetailsarray = [] as any;
  Status: any;
  isLoading = false;
  myForm!: NgForm;
  deleteId: any;
  removerow: any;
  reviewCycledetailyById = {};
  reviewCycleDropDownData = [] as IReviewCycle[];
  @Input() updateData: any;

  constructor(private http: HttpService, private modalService: NgbModal, public rbac: RbacService) { }

  ngOnInit(): void {
    this.editDetails(this.updateData);
    this.empinfo = JSON.parse(localStorage.getItem('rightlyHrUser') || '{}');
    this.getReviewCycledata();
  }

  editDetails(Values: any) {
    // Populate the form with the selected values
    this.UpdateIncrementalpercentage = {
      id: Values.id,
      reviewCycleId: Values.reviewCycleId,
      department: Values.deptName.map((dept: any) => dept.departmentName).join(', '),
      location: Values.locationName.map((loc: any) => loc.locationName).join(', '),
      team: Values.subdeptName.map((loc: any) => loc.subDepartmentName).join(', '),
      sublocation: Values.sublocationName.map((loc: any) => loc.subLocationName).join(', '),
      ratingscale: Values.rating,
    };
    // Populate the rating range loop
    if (this.UpdateIncrementalpercentage.ratingscale) {
      const ratingscale = this.UpdateIncrementalpercentage.ratingscale;
      const [start, end] = ratingscale.split(' to ').map(Number);
      this.ratingrangeloop = Array.from(
        { length: end - start + 1 },
        (_, i) => start + i
      );
    }
    // Map itemsdata to ratingscaledetailsarray
    this.ratingscaledetailsarray = Values?.itemsdata.map((item: any) => {
      return {
        id: item.id, // Include the id of the item
        min: item.min, // Correctly reference min value
        max: item.max, // Correctly reference max value
        ratingDetails: item.items.map((detail: any) => ({
          id: detail.id,
          percentage: detail.percentage,
          ratingColumn: detail.ratingColumn, // Correctly reference ratingColumn
        })),
      };
    });
  }

  // Function to get all review cycle data
  getReviewCycledata() {
    this.subscription = this.http.getData(`reviewCycleHeader`).subscribe({
      next: (data: any) => {
        this.reviewCycleDropDownData = data.items as IReviewCycle[];
      },
      error: (err: any) => {
        console.error('Error fetching review cycle data:', err);
      },
    });
  }

  openModal(content: any) {
    this.modalService.open(content, { centered: true });
  }

  close() {
    this.modalService.dismissAll();
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}