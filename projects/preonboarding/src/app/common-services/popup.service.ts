import { Injectable } from '@angular/core';
import { NgbOffcanvas } from '@ng-bootstrap/ng-bootstrap';
import { SuccessPopupComponent } from '../shared/success-popup/success-popup.component';
import { ErrorPopupComponent } from '../shared/error-popup/error-popup.component';

@Injectable({
  providedIn: 'root'
})
export class PopupService {
  constructor(private offCanvas: NgbOffcanvas) { }

  openSuccessOffCanvas(status: string) {
    const successOffcanvas = this.offCanvas.open(SuccessPopupComponent, { position: 'end', backdrop: 'static' });
    successOffcanvas.componentInstance.status = status;
    setTimeout(() => {
      successOffcanvas.dismiss();
    }, 2000);
  }

  openErrorOffCanvas(status: string){
    const errorOffCanvas = this.offCanvas.open(ErrorPopupComponent,{ position: 'end', backdrop: 'static' });
    errorOffCanvas.componentInstance.status = status;
    setTimeout(() => {
      errorOffCanvas.dismiss();
    }, 2000);
  }
}
