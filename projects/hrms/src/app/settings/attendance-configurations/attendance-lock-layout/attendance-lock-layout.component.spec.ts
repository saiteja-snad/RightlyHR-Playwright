import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AttendanceLockLayoutComponent } from './attendance-lock-layout.component';

describe('AttendanceLockLayoutComponent', () => {
  let component: AttendanceLockLayoutComponent;
  let fixture: ComponentFixture<AttendanceLockLayoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AttendanceLockLayoutComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AttendanceLockLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
