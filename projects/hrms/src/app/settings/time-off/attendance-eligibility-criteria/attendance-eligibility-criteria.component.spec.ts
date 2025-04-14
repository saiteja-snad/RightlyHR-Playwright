import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AttendanceEligibilityCriteriaComponent } from './attendance-eligibility-criteria.component';

describe('AttendanceEligibilityCriteriaComponent', () => {
  let component: AttendanceEligibilityCriteriaComponent;
  let fixture: ComponentFixture<AttendanceEligibilityCriteriaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AttendanceEligibilityCriteriaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AttendanceEligibilityCriteriaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
