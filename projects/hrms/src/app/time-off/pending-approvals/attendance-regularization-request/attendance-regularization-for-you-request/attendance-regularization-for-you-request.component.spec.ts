import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AttendanceRegularizationForYouRequestComponent } from './attendance-regularization-for-you-request.component';

describe('AttendanceRegularizationForYouRequestComponent', () => {
  let component: AttendanceRegularizationForYouRequestComponent;
  let fixture: ComponentFixture<AttendanceRegularizationForYouRequestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AttendanceRegularizationForYouRequestComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AttendanceRegularizationForYouRequestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
