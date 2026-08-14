import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  fetchLetterAssets,
  LetterAssetLoaderOptions,
  LetterAssets,
  setLetterLogoContext
} from '../letters-builder-files/letter-pdf.utils';
import { HttpService } from './http.service';
import { TenantService } from './tenant.service';

@Injectable({
  providedIn: 'root'
})
export class LetterLogoService {
  companyLogo = '';

  constructor(
    private readonly tenantService: TenantService,
    private readonly http: HttpService
  ) {
    this.syncLogoContext(this.tenantService.currentLogo);
    this.tenantService.logo$.subscribe(logo => {
      this.syncLogoContext(logo || this.tenantService.currentLogo);
    });
    this.ensureLogoLoaded();
  }

  ensureLogoLoaded(): void {
    if (!this.tenantService.isLogoLoaded) {
      this.tenantService.verifyDomain(this.tenantService.currentDomain).subscribe();
    }
  }

  getAssetLoaderOptions(): LetterAssetLoaderOptions {
    return {
      viewUrl: environment.viewUrl,
      downloadBlob: filePath => this.downloadLogoBlob(filePath)
    };
  }

  fetchAssets(isSoftCopy: boolean): Promise<LetterAssets> {
    return fetchLetterAssets(isSoftCopy, this.companyLogo, this.getAssetLoaderOptions());
  }

  private syncLogoContext(logo: string): void {
    this.companyLogo = logo;
    setLetterLogoContext(logo, this.getAssetLoaderOptions());
  }

  private downloadLogoBlob(filePath: string): Promise<Blob | null> {
    return firstValueFrom(this.http.DownloadDataWithQuery('FileSystem/Downloadfile', filePath))
      .then(response => (response.body as Blob) ?? null)
      .catch(() => null);
  }
}
