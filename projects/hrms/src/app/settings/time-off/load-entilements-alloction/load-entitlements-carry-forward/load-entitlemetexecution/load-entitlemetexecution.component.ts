import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { HttpService } from '../../../../../services/http.service';
import { OpenModalService } from '../../../../../services/open-modal.service';

@Component({
  selector: 'app-load-entitlemetexecution',
  imports: [CommonModule],
  templateUrl: './load-entitlemetexecution.component.html',
  styleUrl: './load-entitlemetexecution.component.scss'
})
export class LoadEntitlemetexecutionComponent {
  carryforwarddatajobid: any = {}
  empinfo: any = {};
  constructor(
    private route: Router, private http: HttpService,
    private conformationPopup: OpenModalService) { }


  ngOnInit(): void {
    this.empinfo = JSON.parse(localStorage.getItem('rightlyHrUser') || '{}');
    this.carryforwarddatajobid = JSON.parse(localStorage.getItem('carryForwardJobId') ?? '{}')
    if (this.carryforwarddatajobid) {
      this.http.postbyId(`LeaveEntitlementJobs/${this.carryforwarddatajobid}/start`)
        .subscribe({
          next: (res: any) => {
            this.conformationPopup.openSuccessModal("Carry Forward Entilement Successfully");
            setTimeout(() => {
              this.route.navigate(['/settings/timeoff-configurations/load-entitlement/carry-forward']),
                localStorage.removeItem('carryForwardJobId'),
                localStorage.removeItem('loadEntitlement')
            }, 3000);
          },
          error: (err) => {
            console.error(err);
            this.conformationPopup.openErrorModal(err.error.message || "Carry Forward Entilement Failed");
            setTimeout(() => {
              this.route.navigate(['/settings/timeoff-configurations/load-entitlement/carry-forward']),
                localStorage.removeItem('carryForwardJobId'),
                localStorage.removeItem('loadEntitlement')
            }, 3000);
          }
        });
    }


  }
}
