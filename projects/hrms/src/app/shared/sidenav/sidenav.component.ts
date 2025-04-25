import { CommonModule } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { RbacService } from '../../services/rbac.service';

@Component({
  selector: 'app-sidenav',
  imports: [CommonModule, RouterModule],
  templateUrl: './sidenav.component.html',
  styleUrl: './sidenav.component.scss'
})

export class SidenavComponent {
  @ViewChild('logoutpopup') logoutpopup: any;

  constructor(private authService: AuthService, private modalservie: NgbModal, public rbac: RbacService,) {
  }

  onLogout() {
    this.authService.removeToken()
    localStorage.clear()
    window.location.href = "https://login.microsoftonline.com/common/oauth2/v2.0/logout"
  }

  close() {
    this.modalservie.dismissAll();
  }

  openlogoutModal() {
    this.modalservie.open(this.logoutpopup, { centered: true });
  }

}
