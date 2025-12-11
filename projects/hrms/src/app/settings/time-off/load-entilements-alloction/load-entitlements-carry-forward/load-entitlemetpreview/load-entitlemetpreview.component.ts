import { Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Subject, takeUntil } from 'rxjs';
import { FormValidationsService } from '../../../../../services/form-validations.service';
import { HttpService } from '../../../../../services/http.service';
import { OpenModalService } from '../../../../../services/open-modal.service';
import { CommonModule } from '@angular/common';
import { ICarryForward } from '../../../flexible-leave-allocation/leave-allocation.model';
import { InfoIconComponent } from "../../../../../icons/info-icon/info-icon.component";
import { DataLoaderContentComponent } from "../../../../../shared/data-loader-content/data-loader-content.component";
import { NoDataFoundComponent } from '../../../../../shared/no-data-found/no-data-found.component';


@Component({
  selector: 'app-load-entitlemetpreview',
  imports: [CommonModule, InfoIconComponent, NoDataFoundComponent, DataLoaderContentComponent],
  templateUrl: './load-entitlemetpreview.component.html',
  styleUrl: './load-entitlemetpreview.component.scss'
})
export class LoadEntitlemetpreviewComponent {
  carryforwarddata: any = {}
  selectedEmployeeDetail: any = null;
  selectemployeename: any
  selectedfusionEmpId:any
  loading: boolean = false
  destroy$: Subject<boolean> = new Subject<boolean>();
  constructor(private fb: FormBuilder, public formValidations: FormValidationsService, private modalService: NgbModal,
    private route: Router, private http: HttpService, public formValidation: FormValidationsService,
    private conformationPopup: OpenModalService) { }
  ngOnInit(): void {
    this.carryforwarddata = JSON.parse(localStorage.getItem('loadEntitlement') ?? '')
    this.getdataforcarryforward(this.carryforwarddata)
  }

  leaveTypes: string[] = [];
  employeesList: any[] = [];

  getdataforcarryforward(carryforwarddata: ICarryForward) {
    this.loading = true;

    this.http.getData(
      `Reports/LeaveCarryForwardReport?locationIds=${carryforwarddata.location.id}
    &subLocationIds=${carryforwarddata.subLocation.id}
    &shiftIds=${carryforwarddata.shift.id}
    &year=${carryforwarddata.year}&excludeJobProcessedEmployees=true`
    )
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: any) => {
          this.loading = false;
          const data = res.data;

          this.formatCarryList(data);
        },
        error: () => {
          this.loading = false;
        }
      });
  }

  formatCarryList(data: any[]) {
    this.leaveTypes = [...new Set(data.map(x => x.leaveType))];
    const grouped: any = {};
    data.forEach(item => {
      if (!grouped[item.employeeId]) {
        grouped[item.employeeId] = {
          employee: item.employeeName,
          employeeId: item.employeeId,
          fusionEmpId: item.fusionEmpId,
  
          leaveEntries: []   // 👈 store whole list people
        };
      }

      grouped[item.employeeId][item.leaveType] = item.maxCarryForward;

      grouped[item.employeeId].leaveEntries.push({
        leaveType: item.leaveType,
        entitled: item.entitled,
        availed: item.availed,
        balance: item.balance,
        maxCarryForward: item.maxCarryForward,
        actualCarryForward: item.actualCarryForward,
        maxEncashment: item.maxEncashment,
        leaveEncashed: item.leaveEncashed,
        leaveLapsed: item.leaveLapsed
      });
    });

    this.employeesList = Object.values(grouped);
    console.log(this.employeesList);

  }



  openLeaveDetails(row: any, content: any) {
    console.log("row", row);
    this.selectemployeename = row.employee;
    this.selectedfusionEmpId=row.fusionEmpId
    this.selectedEmployeeDetail = row.leaveEntries;

    this.modalService.open(content, { centered: true, size: 'xl', backdrop: 'static' });
    console.log("Entries =>", this.selectedEmployeeDetail);
  }


  navigationtomapcategory() {
    this.route.navigate(['/settings/timeoff-configurations/load-entitlements/load-entitlement-map-categoery'])
  }
  navigationtoback() {
    this.route.navigate(['/settings/timeoff-configurations/load-entitlements/load-entitlement-create'])
  }
}
