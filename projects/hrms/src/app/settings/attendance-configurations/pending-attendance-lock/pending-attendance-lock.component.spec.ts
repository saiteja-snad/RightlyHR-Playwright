import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PendingAttendanceLockComponent } from './pending-attendance-lock.component';

describe('PendingAttendanceLockComponent', () => {
  let component: PendingAttendanceLockComponent;
  let fixture: ComponentFixture<PendingAttendanceLockComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PendingAttendanceLockComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PendingAttendanceLockComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
