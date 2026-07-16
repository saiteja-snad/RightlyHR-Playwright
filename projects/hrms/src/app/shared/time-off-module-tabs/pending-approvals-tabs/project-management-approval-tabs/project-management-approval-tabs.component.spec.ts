import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectManagementApprovalTabsComponent } from './project-management-approval-tabs.component';

describe('ProjectManagementApprovalTabsComponent', () => {
  let component: ProjectManagementApprovalTabsComponent;
  let fixture: ComponentFixture<ProjectManagementApprovalTabsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProjectManagementApprovalTabsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProjectManagementApprovalTabsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
