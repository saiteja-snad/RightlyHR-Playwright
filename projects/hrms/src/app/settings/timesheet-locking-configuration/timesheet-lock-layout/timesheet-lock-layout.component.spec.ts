import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TimesheetLockLayoutComponent } from './timesheet-lock-layout.component';

describe('TimesheetLockLayoutComponent', () => {
  let component: TimesheetLockLayoutComponent;
  let fixture: ComponentFixture<TimesheetLockLayoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TimesheetLockLayoutComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TimesheetLockLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
