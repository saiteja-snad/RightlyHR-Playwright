import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PubllishedAttendanceLockComponent } from './publlished-attendance-lock.component';

describe('PubllishedAttendanceLockComponent', () => {
  let component: PubllishedAttendanceLockComponent;
  let fixture: ComponentFixture<PubllishedAttendanceLockComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PubllishedAttendanceLockComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PubllishedAttendanceLockComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
