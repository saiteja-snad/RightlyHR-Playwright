import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AttendanceEligibilityCriteriaTabsComponent } from './attendance-eligibility-criteria-tabs.component';

describe('AttendanceEligibilityCriteriaTabsComponent', () => {
  let component: AttendanceEligibilityCriteriaTabsComponent;
  let fixture: ComponentFixture<AttendanceEligibilityCriteriaTabsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AttendanceEligibilityCriteriaTabsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AttendanceEligibilityCriteriaTabsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
