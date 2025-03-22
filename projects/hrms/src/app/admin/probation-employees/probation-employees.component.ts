import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-probation-employees',
  imports: [CommonModule,RouterModule],
  templateUrl: './probation-employees.component.html',
  styleUrl: './probation-employees.component.scss'
})
export class ProbationEmployeesComponent {
  constructor(private router: Router, private modalService: NgbModal) { }

  ngOnInit(): void {

  }

  navigateDashboard() {
    this.router.navigate(['/admin/dashboard'])
  }
}
