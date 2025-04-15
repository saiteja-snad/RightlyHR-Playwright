import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PermissionEligibilityCriteriaComponent } from './permission-eligibility-criteria.component';

describe('PermissionEligibilityCriteriaComponent', () => {
  let component: PermissionEligibilityCriteriaComponent;
  let fixture: ComponentFixture<PermissionEligibilityCriteriaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PermissionEligibilityCriteriaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PermissionEligibilityCriteriaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
