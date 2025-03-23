import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { WfhApprovaltabsComponent } from "../../shared/wfh-approvaltabs/wfh-approvaltabs.component";
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-work-from-home',
  imports: [CommonModule, RouterModule, WfhApprovaltabsComponent],
  templateUrl: './work-from-home.component.html',
  styleUrl: './work-from-home.component.scss'
})
export class WorkFromHomeComponent {
  constructor(private modalService: NgbModal) {}

  openModal(content: any) {
    this.modalService.open(content, {centered: true,backdrop: 'static'});
  }
}
