import { CommonModule } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-roles',
  imports: [CommonModule],
  templateUrl: './roles.component.html',
  styleUrl: './roles.component.scss'
})
export class RolesComponent {
  @ViewChild('deletepopup') deletepopup: any;
  @ViewChild('updatepopup') updatepopup: any;

  constructor(private modalService: NgbModal,) { }

  openupdate() {
    this.modalService.open(this.updatepopup, { centered: true, backdrop: 'static' });
  }

  opendelete() {
    this.modalService.open(this.deletepopup, { centered: true, backdrop: 'static' });
  }

  close(){
    this.modalService.dismissAll();
  }
}
