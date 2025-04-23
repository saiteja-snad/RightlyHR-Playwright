import { Injectable } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { SuccessPopupComponent } from '../shared/success-popup/success-popup.component';
import { ErrorPopupComponent } from '../shared/error-popup/error-popup.component';

@Injectable({
  providedIn: 'root'
})
export class PopupService {
  constructor(private modalService: NgbModal) { }

  openSuccess(status: string) {
    const successpopup = this.modalService.open(SuccessPopupComponent, { centered:true, backdrop: 'static' });
    successpopup.componentInstance.status = status;
    setTimeout(() => {
      successpopup.dismiss();
    }, 3000);
  }

  openError(status: string){
    const errorpopup = this.modalService.open(ErrorPopupComponent,{ centered:true, backdrop: 'static' });
    errorpopup.componentInstance.status = status;
    setTimeout(() => {
      errorpopup.dismiss();
    }, 3000);
  }
}
