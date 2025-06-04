import { Component, OnDestroy } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { HttpService } from '../../services/http.service';
import { FormValidationService } from '../../../../../preonboarding/src/app/common-services/form-validation.service';

@Component({
  selector: 'app-assets-allocations-layout',
  imports: [RouterModule],
  templateUrl: './assets-allocations-layout.component.html',
  styleUrl: './assets-allocations-layout.component.scss'
})
export class AssetsAllocationsLayoutComponent implements OnDestroy {
    constructor(
    private readonly http: HttpService,
    private readonly router: Router,
    ) {}

 ngOnDestroy(): void {
    localStorage.removeItem('assetlocationId');
    localStorage.removeItem('assetsublocationId');
    // this.http.assetCountSubject.complete();
    // this.http.avilableassetCountSubject.complete();
    // this.http.allocatedassetCountSubject.complete();
    // this.http.undermatinaceassetCountSubject.complete();
    // this.http.inactiveaceassetCountSubject.complete();
  }
}
