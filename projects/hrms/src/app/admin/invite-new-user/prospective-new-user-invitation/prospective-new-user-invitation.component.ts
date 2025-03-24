import { CommonModule } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Select } from 'primeng/select';
import { NewUserInvitationTabsComponent } from "../../../shared/new-user-invitation-tabs/new-user-invitation-tabs.component";

@Component({
  selector: 'app-prospective-new-user-invitation',
  imports: [CommonModule, Select, NewUserInvitationTabsComponent],
  templateUrl: './prospective-new-user-invitation.component.html',
  styleUrl: './prospective-new-user-invitation.component.scss'
})
export class ProspectiveNewUserInvitationComponent {
  employees = [
    { id: 1, name: 'John Doe' },
    { id: 2, name: 'Jane Smith' },
    { id: 3, name: 'Mark Taylor' },
    { id: 4, name: 'Emily Johnson' }
  ];
  selectedEmployee: any;
  @ViewChild('success') success: any;

  constructor(private router: Router, private modalService: NgbModal) { }

  ngOnInit(): void {

  }

  navigateDashboard() {
    this.router.navigate(['/admin/dashboard'])
  }
}
