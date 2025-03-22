import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
@Component({
  selector: 'app-inactive-employees',
  imports: [CommonModule,RouterModule],
  templateUrl: './inactive-employees.component.html',
  styleUrl: './inactive-employees.component.scss'
})

export class InactiveEmployeesComponent {
  constructor(private router: Router, private modalService: NgbModal) { }

  ngOnInit(): void {

  }

  navigateDashboard() {
    this.router.navigate(['/admin/dashboard'])
  }
}