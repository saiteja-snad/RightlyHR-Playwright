import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AttendanceRegularizationRequestComponent } from './attendance-regularization-request.component';

describe('AttendanceRegularizationRequestComponent', () => {
  let component: AttendanceRegularizationRequestComponent;
  let fixture: ComponentFixture<AttendanceRegularizationRequestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AttendanceRegularizationRequestComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AttendanceRegularizationRequestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
