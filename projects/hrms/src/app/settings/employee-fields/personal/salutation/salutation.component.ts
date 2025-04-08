import { CommonModule } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { OpenModalService } from '../../../../services/open-modal.service';

@Component({
  selector: 'app-salutation',
  imports: [CommonModule],
  templateUrl: './salutation.component.html',
  styleUrl: './salutation.component.scss'
})
export class SalutationComponent {
  @ViewChild('deletepopup') deletepopup: any;
  @ViewChild('updatepopup') updatepopup: any;

  constructor(private modalService: NgbModal,private conformationPopup: OpenModalService,) { }

  openupdate() {
    // this.conformationPopup.openErrorModal("Data Added Successfully");
    this.modalService.open(this.updatepopup, { centered: true, backdrop: 'static' });
  }

  opendelete() {
    this.modalService.open(this.deletepopup, { centered: true, backdrop: 'static' });
  }

  close(){
    this.modalService.dismissAll();
  }
}
