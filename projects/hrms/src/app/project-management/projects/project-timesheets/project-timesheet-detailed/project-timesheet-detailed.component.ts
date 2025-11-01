import { Component } from '@angular/core';
import { InfoIconComponent } from "../../../../icons/info-icon/info-icon.component";
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-project-timesheet-detailed',
  imports: [InfoIconComponent,CommonModule],
  templateUrl: './project-timesheet-detailed.component.html',
  styleUrl: './project-timesheet-detailed.component.scss'
})
export class ProjectTimesheetDetailedComponent {
   constructor(
    public modalService: NgbModal,
    public readonly router: Router
  ) {}


  ngOnInit(): void {

  }

  openModalLarge(content: any) {
    this.modalService.open(content, {centered: true, size: 'lg', backdrop: 'static',});
  }
}
