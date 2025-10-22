import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectEffortReportComponent } from './project-effort-report.component';

describe('ProjectEffortReportComponent', () => {
  let component: ProjectEffortReportComponent;
  let fixture: ComponentFixture<ProjectEffortReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProjectEffortReportComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProjectEffortReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
