import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AttendanceRegularizationEligibilityCriteriaComponent } from './attendance-regularization-eligibility-criteria.component';

describe('AttendanceRegularizationEligibilityCriteriaComponent', () => {
  let component: AttendanceRegularizationEligibilityCriteriaComponent;
  let fixture: ComponentFixture<AttendanceRegularizationEligibilityCriteriaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AttendanceRegularizationEligibilityCriteriaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AttendanceRegularizationEligibilityCriteriaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
