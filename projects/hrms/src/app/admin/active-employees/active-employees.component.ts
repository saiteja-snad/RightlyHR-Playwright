import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
@Component({
  selector: 'app-active-employees',
  imports: [CommonModule,RouterModule],
  templateUrl: './active-employees.component.html',
  styleUrl: './active-employees.component.scss'
})

export class ActiveEmployeesComponent {
  constructor(private router: Router, private modalService: NgbModal) { }

  ngOnInit(): void {

  }

  navigateDashboard() {
    this.router.navigate(['/admin/dashboard'])
  }
}
