import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectWaitingForApprovalResourcesComponent } from './project-waiting-for-approval-resources.component';

describe('ProjectWaitingForApprovalResourcesComponent', () => {
  let component: ProjectWaitingForApprovalResourcesComponent;
  let fixture: ComponentFixture<ProjectWaitingForApprovalResourcesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProjectWaitingForApprovalResourcesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProjectWaitingForApprovalResourcesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
