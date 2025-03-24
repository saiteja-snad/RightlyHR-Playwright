import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
@Component({
  selector: 'app-active-interns',
  imports: [CommonModule],
  templateUrl: './active-interns.component.html',
  styleUrl: './active-interns.component.scss'
})

export class ActiveInternsComponent {
  constructor(private router: Router, private modalService: NgbModal) { }

  ngOnInit(): void {

  }

  navigateDashboard() {
    this.router.navigate(['/admin/dashboard'])
  }
}
