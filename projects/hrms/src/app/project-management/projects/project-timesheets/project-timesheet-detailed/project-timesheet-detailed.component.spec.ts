import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectTimesheetDetailedComponent } from './project-timesheet-detailed.component';

describe('ProjectTimesheetDetailedComponent', () => {
  let component: ProjectTimesheetDetailedComponent;
  let fixture: ComponentFixture<ProjectTimesheetDetailedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProjectTimesheetDetailedComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProjectTimesheetDetailedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
