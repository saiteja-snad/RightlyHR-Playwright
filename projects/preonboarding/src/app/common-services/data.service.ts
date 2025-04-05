import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})

export class DataService {
  getExperience = signal<boolean>(false);
  getEducation = signal<boolean>(false);

  constructor() { }

}