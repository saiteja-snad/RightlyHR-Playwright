import { Injectable } from '@angular/core';

import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { SuccessContentPopupComponent } from '../shared/error-content-popup/success-content-popup/success-content-popup.component';
import { ErrorContentPopupComponent } from '../shared/error-content-popup/error-content-popup.component';

@Injectable({
  providedIn: 'root'
})

export class OpenSuccessModalService {

  constructor(private modalService: NgbModal) { }
  
  openSuccessModal(status: string) {
    const successModal = this.modalService.open(SuccessContentPopupComponent, { centered:true, backdrop: 'static' });
    successModal.componentInstance.status = status;
    setTimeout(() => {
      successModal.dismiss();
    }, 2000);
  }

  openErrorModal(status: string, duration: number = 2500){
    const errorModal = this.modalService.open(ErrorContentPopupComponent,{centered:true , backdrop: 'static' });
    errorModal.componentInstance.status = status;
    setTimeout(() => {
      errorModal.dismiss();
    }, duration);
  }


}
