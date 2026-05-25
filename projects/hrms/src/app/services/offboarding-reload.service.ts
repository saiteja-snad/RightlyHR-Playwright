import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class OffboardingReloadService {
  private reloadTrigger = new Subject<void>();
  
  reloadTrigger$ = this.reloadTrigger.asObservable();
  
  triggerReload() {
    this.reloadTrigger.next();
  }
}