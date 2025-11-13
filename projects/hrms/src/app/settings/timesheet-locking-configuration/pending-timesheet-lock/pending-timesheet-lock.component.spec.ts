import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PendingTimesheetLockComponent } from './pending-timesheet-lock.component';

describe('PendingTimesheetLockComponent', () => {
  let component: PendingTimesheetLockComponent;
  let fixture: ComponentFixture<PendingTimesheetLockComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PendingTimesheetLockComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PendingTimesheetLockComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
