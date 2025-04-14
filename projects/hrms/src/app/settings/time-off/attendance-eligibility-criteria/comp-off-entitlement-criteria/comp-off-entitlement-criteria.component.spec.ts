import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompOffEntitlementCriteriaComponent } from './comp-off-entitlement-criteria.component';

describe('CompOffEntitlementCriteriaComponent', () => {
  let component: CompOffEntitlementCriteriaComponent;
  let fixture: ComponentFixture<CompOffEntitlementCriteriaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CompOffEntitlementCriteriaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CompOffEntitlementCriteriaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
