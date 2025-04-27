import { Component } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { NoDataFoundComponent } from '../../../../shared/no-data-found/no-data-found.component';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { HttpService } from '../../../../services/http.service';
import { NgbModal, NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder } from '@angular/forms';
import { RbacService } from '../../../../services/rbac.service';
import { IPolicy } from '../pending-policies/policies.model';

@Component({
  selector: 'app-published-policies',
  imports: [CommonModule, NoDataFoundComponent, TranslateModule, NgbPopoverModule],
  templateUrl: './published-policies.component.html',
  styleUrl: './published-policies.component.scss'
})
export class PublishedPoliciesComponent {
  
  subscription!: Subscription
  allPolicies: IPolicy[] = [];

  constructor(public router: Router, private http: HttpService, public rbac: RbacService) { }
  
  ngOnInit(): void {
    this.getAllPolicies();
  }
  
  nagvition() {
    this.router.navigate(['/settings/employee-fields/addpolices']);
  }

  updateNavigation(policy: any) {
    localStorage.setItem('updatepolicies', JSON.stringify(policy));
    this.router.navigate(['/settings/employee-fields/updatepolices']);
  }

  getAllPolicies() {
    this.subscription = this.http.getData('orgPolicies').subscribe({
      next: (data: any) => {
        console.log(data);
        this.allPolicies = data.filter(
          (status: { status: string; }) => status.status === 'Published'
        );
        console.log(this.allPolicies);
      }, error: (err: any) => {
        console.error(err);
      }
    })

  }
  clonePolicy1(id: any): void {
    localStorage.setItem('cloningPolicyId', id);
    this.router.navigate(['/settings/employee-fields/clonepolices',id]);
  }

  viewPublishedPolicy(holiday: any) {
    console.log(holiday);
    localStorage.setItem('viewpolicies', JSON.stringify(holiday));
    this.router.navigate(['/settings/employee-fields/viewpolices']);
    
  }

  getPolicyNames(policy: any) {
    return policy.shiftName || '';
 }
}
