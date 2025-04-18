import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Select } from 'primeng/select';
import { TabsModule } from 'primeng/tabs';
import { HttpService } from '../../services/http.service';
import { OpenModalService } from '../../services/open-modal.service';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-assets-managment',
  imports: [CommonModule, TabsModule, Select, RouterModule, ReactiveFormsModule, FormsModule],
  templateUrl: './assets-managment.component.html',
  styleUrl: './assets-managment.component.scss'
})
export class AssetsManagmentComponent {
  navTabs: any[] = [];

  constructor(
    private readonly fb: FormBuilder,
    private http: HttpService, private modalService: NgbModal, private conformationPopup: OpenModalService,) { }
  ngOnInit(): void {

    this.navTabs = [
      { label: 'All', route: '/assets-allocation/management/all-assets', count$: this.http.deskTotalCountSubject },
      { label: 'Available', route: '/assets-allocation/management/available-assets', count$: this.http.deskAvailableCountSubject },
      { label: 'Allocated', route: '/assets-allocation/management/allocated-assets', count$: this.http.deskAllocatedCountSubject },
      { label: 'Under Maintenance', route: '/desk/management/under-maintenance-assets', count$: this.http.deskUndermaindanaenceCountSubject },
      { label: 'Inactive', route: '/assets-allocation/management/inactive-assets', count$: this.http.deskinactiveCountSubject },
    ];
  }
}