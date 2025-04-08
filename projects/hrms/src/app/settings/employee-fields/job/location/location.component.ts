import { CommonModule } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-location',
  imports: [CommonModule],
  templateUrl: './location.component.html',
  styleUrl: './location.component.scss'
})
export class LocationComponent {
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
