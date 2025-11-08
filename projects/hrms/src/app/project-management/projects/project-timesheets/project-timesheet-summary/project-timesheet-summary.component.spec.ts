import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectTimesheetSummaryComponent } from './project-timesheet-summary.component';

describe('ProjectTimesheetSummaryComponent', () => {
  let component: ProjectTimesheetSummaryComponent;
  let fixture: ComponentFixture<ProjectTimesheetSummaryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProjectTimesheetSummaryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProjectTimesheetSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
