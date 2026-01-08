import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeeExitFeedbackComponent } from './employee-exit-feedback.component';

describe('EmployeeExitFeedbackComponent', () => {
  let component: EmployeeExitFeedbackComponent;
  let fixture: ComponentFixture<EmployeeExitFeedbackComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmployeeExitFeedbackComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmployeeExitFeedbackComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
