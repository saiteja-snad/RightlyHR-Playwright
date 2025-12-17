import { Component } from '@angular/core';
import { OpenModalService } from '../../../../../../services/open-modal.service';
import { Router } from '@angular/router';
import { HttpService } from '../../../../../../services/http.service';

@Component({
  selector: 'app-intial-load-entitlement-execution',
  imports: [],
  templateUrl: './intial-load-entitlement-execution.component.html',
  styleUrl: './intial-load-entitlement-execution.component.scss'
})
export class IntialLoadEntitlementExecutionComponent {
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

            this.conformationPopup.openSuccessModal("Initial Leave Entitlements Successfully");
            setTimeout(() => {
              this.route.navigate(['/settings/timeoff-configurations/load-entitlement/initial-load-entitlements'])
              localStorage.removeItem('intialloadEntitlement')
              localStorage.removeItem('carryForwardJobId')
            }, 2000);
          },
          error: (err) => {
            console.error(err);
          }
        });
    }

  }
}
