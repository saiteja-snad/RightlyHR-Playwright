import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { HttpService } from '../../../../../../services/http.service';
import { Router } from '@angular/router';
import { ICarryForward } from '../../../../flexible-leave-allocation/leave-allocation.model';
import { Subject, takeUntil } from 'rxjs';
import { NoDataFoundComponent } from "../../../../../../shared/no-data-found/no-data-found.component";
import { DataLoaderContentComponent } from "../../../../../../shared/data-loader-content/data-loader-content.component";
import { OpenModalService } from '../../../../../../services/open-modal.service';

@Component({
  selector: 'app-intial-load-entitlement-preview',
  imports: [CommonModule, NoDataFoundComponent, DataLoaderContentComponent,],
  templateUrl: './intial-load-entitlement-preview.component.html',
  styleUrl: './intial-load-entitlement-preview.component.scss'
})
export class IntialLoadEntitlementPreviewComponent {
  empinfo: any = {};
  carryforwarddata: any = {}
  loading: boolean = false;
  destroy$: Subject<boolean> = new Subject<boolean>();
  constructor(private modalService: NgbModal, private conformationPopup: OpenModalService,
    private route: Router, private http: HttpService) { }
  ngOnInit(): void {
    this.empinfo = JSON.parse(localStorage.getItem("rightlyHrUser") || '{}');
    this.carryforwarddata = JSON.parse(localStorage.getItem('intialloadEntitlement') ?? '{}');
    this.getdataforcarryforward(this.carryforwarddata);
  }

  gradeAssignments: {
    status: any;
    data: any[];
  } | null = null;

  isGradeAssignmentSuccess=false
  failedGradeEmployees: any[] = [];
  getdataforcarryforward(carryforwarddata: any) {

    this.loading = true;
    this.http.getData(
      `Employeedata/employees/with-leave-categories?locationIds=${carryforwarddata?.location?.id}
      &subLocationIds=${carryforwarddata?.subLocation?.id}
      &shiftIds=${carryforwarddata?.shift?.id}
      &year=${carryforwarddata?.year}&categoryIds=${carryforwarddata?.categoryIds}`
    ).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res: any) => {
        this.loading = false;
        this.mapEmployees(res.data.employees);
        // ✅ Store entire object
        this.gradeAssignments = res.data.gradeAssignments;

        // Optional helpers
        this.isGradeAssignmentSuccess = res.gradeAssignments?.status === 'success';
        this.failedGradeEmployees = res.gradeAssignments?.data || [];
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  leaveHeaders: any[] = [];
  employeesTableData: any[] = [];
  leaveEntries: any[] = []
  mapEmployees(employees: any[]) {
    const headerMap = new Map<string, any>();

    this.employeesTableData = employees.map(emp => {
      const leaveValues: any = {};
      const leaveEntries: any[] = []; // ✅ PER EMPLOYEE

      emp.leaveCategories.forEach((lc: any) => {
        const category = lc.orgLeaveCategories;
        const code = category.categoryCode;

        leaveValues[code] = lc.allowedDays;

        leaveEntries.push({
          leaveCategoryId: lc.categoryId, // ✅ REQUIRED
          categoryCode: code,
          allowedDays: lc.allowedDays
        });

        if (!headerMap.has(code)) {
          headerMap.set(code, {
            code,
            name: category.name,
            color: category.categoryColor
          });
        }
      });

      return {
        employeeId: emp.employeeId,
        gradeId: emp.gradeId,
        employeeName: `${emp.firstName} ${emp.lastName}`,
        joinedDate: emp.dateOfJoining,
        location: emp.locationName,
        shift: emp.shiftName,
        grade: emp.gradeName,
        leaveValues,
        leaveEntries // ✅ attached correctly
      };
    });

    this.leaveHeaders = Array.from(headerMap.values());
  }



  buildCarryForwardPayload() {
    return {
      jobType: "InitialLoad",
      year: this.carryforwarddata.year,
      locationId: this.carryforwarddata.location.id,
      subLocationId: this.carryforwarddata.subLocation.id,
      shiftId: this.carryforwarddata.shift.id,
      notes: '',
      initiatedBy: this.empinfo.employeeId,

      requestPayload: {
        employees: this.employeesTableData.map(emp => ({
          employeeId: emp.employeeId,
          gradeId: emp.gradeId,

          entitlementsData: (emp.leaveEntries || [])
            .filter((x: { allowedDays: number; }) => x.allowedDays > 0)
            .map((x: { leaveCategoryId: any; allowedDays: any; }) => ({
              leaveCategoryId: x.leaveCategoryId,
              noOfDays: x.allowedDays
            }))
        }))
      }
    };
  }


  submit() {
    const body = this.buildCarryForwardPayload();
    this.http.postdata('LeaveEntitlementJobs/create-initial-load', body).subscribe({
      next: (res: any) => {
        this.conformationPopup.openSuccessModal("Carry Forward Entilement Successfully");
        setTimeout(() => {
          this.route.navigate(['/settings/timeoff-configurations/load-entitlement/initial-load-entitlements'])
          localStorage.removeItem('intialloadEntitlement')
        }, 2000);
      },
      error: (err) => {
        console.error(err);
      }
    });
  }

}
