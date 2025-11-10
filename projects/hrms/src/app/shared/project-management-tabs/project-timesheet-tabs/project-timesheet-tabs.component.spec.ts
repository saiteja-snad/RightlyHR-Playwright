import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectTimesheetTabsComponent } from './project-timesheet-tabs.component';

describe('ProjectTimesheetTabsComponent', () => {
  let component: ProjectTimesheetTabsComponent;
  let fixture: ComponentFixture<ProjectTimesheetTabsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProjectTimesheetTabsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProjectTimesheetTabsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
