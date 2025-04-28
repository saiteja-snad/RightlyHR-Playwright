import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { RbacService } from '../../../services/rbac.service';

@Component({
  selector: 'app-shits',
  imports: [CommonModule, RouterModule],
  templateUrl: './shits.component.html',
  styleUrl: './shits.component.scss'
})
export class ShitsComponent {

  constructor(public router: Router, public rbac: RbacService) { }

  nagvition() {
    this.router.navigate(['/settings/employee-fields/addshifts']);
  }
}
