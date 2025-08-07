import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class OrgchartService {
  private actionSubject = new Subject<{ type: string }>();
  actions$ = this.actionSubject.asObservable();

  triggerAction(type: string) {
    this.actionSubject.next({ type });
  }

  private compensationamounttureorfalse= new BehaviorSubject<boolean>(false);
  compensationAmount$ = this.compensationamounttureorfalse.asObservable();

  setCompensationAmount(isCompensated: boolean) {
    console.log(isCompensated, 'isCompensated');
    this.compensationamounttureorfalse.next(isCompensated);
  }
}