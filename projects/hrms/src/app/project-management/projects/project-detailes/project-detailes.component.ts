import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { HttpService } from '../../../services/http.service';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Project } from '../../../Interfaces/projects.model';
import { RbacService } from '../../../services/rbac.service';
import { Skeleton } from 'primeng/skeleton';
@Component({
  selector: 'app-project-detailes',
  imports: [CommonModule, ReactiveFormsModule, Skeleton],
  templateUrl: './project-detailes.component.html',
  styleUrl: './project-detailes.component.scss'
})

export class ProjectDetailesComponent implements OnInit, OnDestroy {
  destroy$: Subject<boolean> = new Subject<boolean>();
  projectsData: Project[] = [];
  addprojectform!: FormGroup;
  loading: boolean = false;

  constructor(private fb: FormBuilder, private route: ActivatedRoute, private http: HttpService, public rbac: RbacService) { }

  ngOnInit(): void {
    this.createProjectForm();
    this.route.queryParams.subscribe(params => {
      const projectId = params['id'];
      if (projectId) {
        this.getProjects(projectId);
        console.log("Project ID:", projectId);
      }
    });
  }

  createProjectForm() {
    this.addprojectform = this.fb.group({
      projectName: [{ value: null, disabled: true }],
      clientName: [{ value: null, disabled: true }],
      startDate: [{ value: null, disabled: true }],
      endDate: [{ value: null, disabled: true }],
      effectiveDate: [{ value: null, disabled: true }],
      kickoffDate: [{ value: null, disabled: true }],
      projectType: [{ value: null, disabled: true }],
      statuts: [{ value: null, disabled: true }],
      allocatedHours: [{ value: null, disabled: true }],
      overtimeEligible: [{ value: false, disabled: true }],
      billable: [{ value: false, disabled: true }],
      allowweekendWork: [{ value: false, disabled: true }],
      approvalidAuthority: [{ value: null, disabled: true }]
    });
  }

  getProjects(projectId: string) {
    this.loading = true
    this.http.getData(`Project?projectId=${projectId}`).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res: any) => {
        this.loading = false;
        this.projectsData = res?.data ?? []; // Extract "data" array
        const authority = this.projectsData[0]?.pendingApprovalAuthority;
        const approvalidAuthority = authority ? `${authority.fusionEmpId} - ${authority.name}` : '';
        this.addprojectform.patchValue({
          projectName: this.projectsData[0]?.projectName,
          clientName: this.projectsData[0]?.client?.clientName,
          startDate: this.formatDateToLocal(this.projectsData[0]?.startDate),
          endDate: this.formatDateToLocal(this.projectsData[0]?.endDate),
          effectiveDate: this.formatDateToLocal(this.projectsData[0]?.effectiveDate),
          kickoffDate: this.formatDateToLocal(this.projectsData[0]?.kickoffDate),
          projectType: this.projectsData[0]?.projectType,
          statuts: this.projectsData[0]?.status,
          clientid: this.projectsData[0]?.client.clientId,
          allocatedHours: this.projectsData[0]?.allocatedHours,
          approvalidAuthority: approvalidAuthority,
          overtimeEligible: this.projectsData[0]?.isOvertimeEligibile,
          allowweekendWork: this.projectsData[0]?.isWeekendWorkAllowed,
          billable: this.projectsData[0].isBillable,
        });
        const clientid = this.projectsData[0]?.client?.clientId;
        this.http.updateClientId(clientid);
      },
      error: (err) => {
        this.loading = false
        console.error('Error fetching projects data:', err);
        (this.http.clientId$ as Subject<any>).next(null);
        this.projectsData = [];
      },

    });
  }

  formatDateToLocal(dateString: string) {
    if (dateString) {
      const date = new Date(dateString);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
    return null; // Return null or handle the case when dateString is empty or invalid
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.complete();
  }
}