import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
@Component({
  selector: 'app-prospective-employees',
  imports: [CommonModule],
  templateUrl: './prospective-employees.component.html',
  styleUrl: './prospective-employees.component.scss'
})

export class ProspectiveEmployeesComponent implements OnInit {
  
  constructor(private router: Router) { }

  ngOnInit(): void {

  }

  navigateDashboard(){
    this.router.navigate(['/dashboard'])
  }
}
