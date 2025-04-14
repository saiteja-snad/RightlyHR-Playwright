import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {

  constructor() { }
  public getYears():number[]{
    const currentYear = new Date().getFullYear();
    let yearsList:number[] = []
    for (let i = -1; i < 11; i++) {
      yearsList.push(currentYear + i);
    }
    return yearsList;
  }
}
