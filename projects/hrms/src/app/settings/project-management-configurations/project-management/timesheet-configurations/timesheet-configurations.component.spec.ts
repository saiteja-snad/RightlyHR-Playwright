import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TimesheetConfigurationsComponent } from './timesheet-configurations.component';

describe('TimesheetConfigurationsComponent', () => {
  let component: TimesheetConfigurationsComponent;
  let fixture: ComponentFixture<TimesheetConfigurationsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TimesheetConfigurationsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TimesheetConfigurationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
