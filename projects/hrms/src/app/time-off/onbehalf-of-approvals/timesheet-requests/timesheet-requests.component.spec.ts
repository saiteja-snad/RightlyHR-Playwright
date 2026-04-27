import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TimesheetRequestsComponent } from './timesheet-requests.component';

describe('TimesheetRequestsComponent', () => {
  let component: TimesheetRequestsComponent;
  let fixture: ComponentFixture<TimesheetRequestsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TimesheetRequestsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TimesheetRequestsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
