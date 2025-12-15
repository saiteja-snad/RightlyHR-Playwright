import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { HttpService } from '../../../../../../services/http.service';
import { Router } from '@angular/router';
import { ICarryForward } from '../../../../flexible-leave-allocation/leave-allocation.model';
import { Subject, takeUntil } from 'rxjs';
import { NoDataFoundComponent } from "../../../../../../shared/no-data-found/no-data-found.component";
import { DataLoaderContentComponent } from "../../../../../../shared/data-loader-content/data-loader-content.component";

@Component({
  selector: 'app-intial-load-entitlement-preview',
  imports: [CommonModule, NoDataFoundComponent, DataLoaderContentComponent],
  templateUrl: './intial-load-entitlement-preview.component.html',
  styleUrl: './intial-load-entitlement-preview.component.scss'
})
export class IntialLoadEntitlementPreviewComponent {
  empinfo: any = {};
  carryforwarddata: any = {}
  loading: boolean = false;
  destroy$: Subject<boolean> = new Subject<boolean>();
  constructor(private modalService: NgbModal,
    private route: Router, private http: HttpService) { }
  ngOnInit(): void {
    this.empinfo = JSON.parse(localStorage.getItem("rightlyHrUser") || '{}');
    this.carryforwarddata = JSON.parse(localStorage.getItem('intialloadEntitlement') ?? '{}');
    this.getdataforcarryforward(this.carryforwarddata);
  }


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

      },
      error: () => {
        this.loading = false;
      }
    });
  }

  leaveHeaders: any[] = [];
  employeesTableData: any[] = [];

  mapEmployees(employees: any[]) {
    const headerMap = new Map<string, any>();

    this.employeesTableData = employees.map(emp => {
      const leaveValues: any = {};

      emp.leaveCategories.forEach((lc: any) => {
        const category = lc.orgLeaveCategories;
        const code = category.categoryCode;

        leaveValues[code] = lc.allowedDays;

        // collect headers only once
        if (!headerMap.has(code)) {
          headerMap.set(code, {
            code,
            name: category.name,
            color: category.categoryColor
          });
        }
      });

      return {
        employeeName: `${emp.firstName} ${emp.lastName}`,
        joinedDate: emp.dateOfJoining,
        location: emp.locationName,
        shift: emp.shiftName,
        grade: emp.gradeName,
        leaveValues
      };
    });

    this.leaveHeaders = Array.from(headerMap.values());
  }


}
