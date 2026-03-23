import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExitFeedbackReportsComponent } from './exit-feedback-reports.component';

describe('ExitFeedbackReportsComponent', () => {
  let component: ExitFeedbackReportsComponent;
  let fixture: ComponentFixture<ExitFeedbackReportsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExitFeedbackReportsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExitFeedbackReportsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});