import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AddProspectiveInternComponent } from './add-prospective-intern/add-prospective-intern.component';

@Component({
  selector: 'app-prospective-interns',
  imports: [CommonModule,],
  templateUrl: './prospective-interns.component.html',
  styleUrl: './prospective-interns.component.scss'
})
export class ProspectiveInternsComponent {
  constructor(private router: Router, private modalService: NgbModal) { }

  ngOnInit(): void {

  }

  openAddProspective() {
    this.modalService.open(AddProspectiveInternComponent, { centered: true, backdrop: 'static', size:'lg' });
  }

  navigateDashboard() {
    this.router.navigate(['/admin/dashboard'])
  }
}
