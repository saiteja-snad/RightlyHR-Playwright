import { Injectable } from '@angular/core';
import { SuccessContentPopupComponent } from '../shared/success-content-popup/success-content-popup.component';
import { ErrorContentPopupComponent } from '../shared/error-content-popup/error-content-popup.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Injectable({
  providedIn: 'root'
})
export class OpenModalService {

  constructor(private modalService: NgbModal) { }
  
  openSuccessModal(status: string) {
    const successModal = this.modalService.open(SuccessContentPopupComponent, { centered:true, backdrop: 'static' });
    successModal.componentInstance.status = status;
    setTimeout(() => {
      successModal.dismiss();
    }, 2000);
  }

  openErrorModal(status: string){
    const errorModal = this.modalService.open(ErrorContentPopupComponent,{centered:true , backdrop: 'static' });
    errorModal.componentInstance.status = status;
    setTimeout(() => {
      errorModal.dismiss();
    }, 2000);
  }
}
