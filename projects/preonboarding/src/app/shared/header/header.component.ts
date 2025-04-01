import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-header',
  imports: [CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})

export class HeaderComponent implements OnInit{
  prospectiveEmpData = {} as any;
  @ViewChild('logoutpopup') logoutpopup: any;

  constructor(private router:Router, private modalservie:NgbModal){ }

  ngOnInit(): void {
    this.prospectiveEmpData = JSON.parse(localStorage.getItem("prospectiveemppersonaldata") || '{}')
  }

  openlogoutModal(){
    this.modalservie.open(this.logoutpopup,{centered:true});
  }

  close(){
    this.modalservie.dismissAll();
  }

  logOut(){
    localStorage.removeItem('prospectiveusertoken');
    localStorage.removeItem('prospectiveemppersonaldata');
    this.modalservie.dismissAll();
    this.router.navigate(['']);
  }
}
